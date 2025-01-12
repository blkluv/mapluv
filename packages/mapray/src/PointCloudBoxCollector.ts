import GeoMath, { Vector3, Vector4 } from "./GeoMath";
import RenderStage from "./RenderStage";
import RenderFlake from "./RenderFlake";
import PointCloud from "./PointCloud";
import PointCloudBoxRenderObject from "./PointCloudBoxRenderObject";
import PointCloudCollection from "./PointCloudCollection";



/**
 * Boxを収集するツール
 * @internal
 */
class PointCloudBoxCollector {

    private _point_cloud_collection: PointCloudCollection;

    private _render_boxes: PointCloudBoxRenderObject[];

    private _render_boxes_map: Map<PointCloud.Box, PointCloudBoxRenderObject>;

    private _load_boxes: PointCloudBoxRenderObject[];

    private _load_limit: number;

    /**
     *  位置ベクトル Q
     *  @see doc/ImageLevelCalculation.txt
     */
    private _view_pos_Q!: Vector3;

    /**
     *  ベクトル w * U
     *  @see doc/ImageLevelCalculation.txt
     */
    private _view_dir_wU!: Vector3;

    private _points_per_pixel!: number;

    private _dispersion!: boolean;

    private _statistics?: PointCloud.Statistics;

    private _clip_planes!: Vector4[];

    private _volume_planes?: Vector4[];

    /**
     * 非表示Boxを破棄するかどうか
     * pick stageで1x1描画する場合に画面外のBoxがunloadされてしまうのを防ぐ
     */
    private _unloadInvisible: boolean;



    /**
     * @param stage   所有者である RenderStage
     * @param load_limit 読み込みが必要なBoxリストに保持する要素数の上限
     */
    constructor( stage: RenderStage, load_limit: number = 10 )
    {
        this._setupViewVectors( stage );
        this._setupClipPlanes( stage );
        this._unloadInvisible = ( stage.getRenderTarget() === RenderStage.RenderTarget.SCENE );

        // @ts-ignore
        this._point_cloud_collection = stage._point_cloud_collection;

        /**
         * 描画するBoxのリスト。
         * @private
         */
        this._render_boxes = [];

        /**
         * Box => PointCloudBoxRenderObject の辞書
         * @private
         */
        this._render_boxes_map = new Map();

        /**
         * 読み込みが必要なBoxリスト。常に優先度でソート済み。
         * @private
         */
        this._load_boxes = [];

        /**
         * 読み込みが必要なBoxリストの要素数の上限
         * @private
         */
        this._load_limit = load_limit;
    }


    /**
     */
    private _setupViewVectors( stage: RenderStage )
    {
        // @ts-ignore
        const view_to_gocs = stage._view_to_gocs;
        // @ts-ignore
        const   pixel_step = stage._pixel_step;
 
        const view_pos_Q  = GeoMath.createVector3();
        const view_dir_wU = GeoMath.createVector3();

        // 地表詳細レベル (LOD) 計算用の Q, w*U ベクトルを設定
        view_pos_Q[0] = view_to_gocs[12];
        view_pos_Q[1] = view_to_gocs[13];
        view_pos_Q[2] = view_to_gocs[14];

        view_dir_wU[0] = -view_to_gocs[ 8] * pixel_step;
        view_dir_wU[1] = -view_to_gocs[ 9] * pixel_step;
        view_dir_wU[2] = -view_to_gocs[10] * pixel_step;

        this._view_pos_Q  = view_pos_Q;

        this._view_dir_wU = view_dir_wU;
    }


    /**
     */
    private _setupClipPlanes( stage: RenderStage )
    {
        // @ts-ignore
        const  view_to_gocs = stage._view_to_gocs;
        // @ts-ignore
        const  gocs_to_view = stage._gocs_to_view;

        const volume_planes = stage.getVolumePlanes();
        this._volume_planes = volume_planes;

        // const volume_planes = stage._volume_planes;
        const   clip_planes = [];

        // 地表遮蔽カリング平面
        const root_flake = stage.viewer.globe.root_flake;
        const       rmin = GeoMath.EARTH_RADIUS + root_flake.height_min;  // 最小半径
        const       rmax = GeoMath.EARTH_RADIUS + root_flake.height_max;  // 最大半径

        // P (視点位置)
        const px = view_to_gocs[12];
        const py = view_to_gocs[13];
        const pz = view_to_gocs[14];

        // q = √[(P.P - rmin^2)(rmax^2 - rmin^2)] - rmin^2
        const    p2 = px*px + py*py + pz*pz;
        const rmin2 = rmin*rmin;
        const rmax2 = rmax*rmax;
        const     q = Math.sqrt( (p2 - rmin2) * (rmax2 - rmin2) ) - rmin2;

        // L = <P, q> / ‖P‖
        const plane = GeoMath.createVector4();
        const recip = 1 / Math.sqrt( p2 );
        plane[0] = px * recip;
        plane[1] = py * recip;
        plane[2] = pz * recip;
        plane[3] =  q * recip;
        // clip_planes.push( plane );

        // L を基とした遠方距離
        const far_dist = Math.sqrt( p2 + rmax2 + 2*q );

        // 視体積平面を取得して、地心直交座標系に変換
        // (直交変換なので x, y, z は正規化されている)
        for ( let i = 0; i < 6; ++i ) {
            let   src_plane = volume_planes[i];
            const dst_plane = GeoMath.createVector4();

            if ( i == 1 && src_plane[3] > far_dist ) {
                // 遠方平面が必要以上に遠いとき far_dist に置き換える
                src_plane    = GeoMath.createVector4( src_plane );
                src_plane[3] = far_dist;
            }

            GeoMath.transformPlane_A( gocs_to_view, src_plane, dst_plane );

            clip_planes.push( dst_plane );
        }

        this._clip_planes = clip_planes;
    }


    /**
     * 点群Boxを収集する
     * @param point_cloud 点群
     * @param statistics 統計情報
     * @return 収集された点群Boxの集合
     */
    traverse( point_cloud: PointCloud, statistics?: PointCloud.Statistics ): { visible_boxes: PointCloudBoxRenderObject[], load_boxes: PointCloudBoxRenderObject[] }
    {
        this._points_per_pixel = point_cloud.getPointsPerPixel();
        this._dispersion       = point_cloud.getDispersion();

        this._statistics = statistics;
        this._updateBox( point_cloud.root, 0 );
        return {
            visible_boxes: this._render_boxes,
            load_boxes: this._load_boxes,
        };
    }


    /**
     */
    private _updateBox( box: PointCloud.Box, parent_ppp: number ) {
        if ( this._statistics ) {
            this._statistics.total_boxes++;
            if ( box.status === PointCloud.Box.Status.LOADING ) this._statistics.loading_boxes++;
            if ( box.vertex_length ) {
                this._statistics.total_point_count += box.vertex_length;
            }
        }

        if ( box.isInvisible( this._clip_planes ) ) {
            if ( this._unloadInvisible ) {
                box.disposeChildren( this._statistics );
            }
            return;
        }

        let box_ppp, lodStatus;
        if ( box.is_loaded ) {
            box_ppp = this._calcPointsPerPixel( box );
            lodStatus = box_ppp < this._points_per_pixel ? LodStatus.LOAD_NEXT_LEVEL : LodStatus.UNLOAD_NEXT_LEVEL;
        }
        else {
            lodStatus = LodStatus.KEEP_STATUS;
        }

        if ( lodStatus === LodStatus.LOAD_NEXT_LEVEL ) { // if more detaild data is required then load nextLevel
            // 子Boxを読み込む
            this._collectNextLevel( box, box_ppp as number );

            // 子Boxがない領域を描画する
            //  [box]
            //    |--a1--[B]
            //    |--a2--[C]
            //    |--a3-- x
            //    `--a4-- x
            //    - boxは、8分割された領域のうち、a1, a2, a3、a4の領域に点が含まれている。
            //    - このうちa1, a2については子Box(B, C)があり、a3, a4は子Boxを持っていない。
            //    - この場合、a3, a4の領域についはAが描画する。（a1, a2の領域については、B, Cにより描画される）
            for ( let i=0; i<8; i++ ) {
                if ( box.cellPointsAvailable( i ) && !box.getChild( i ) ) {
                    this._pushBox( box, i, box_ppp as number, parent_ppp );
                }
            }
            return;
        }
        else if ( lodStatus === LodStatus.UNLOAD_NEXT_LEVEL ) { // if more detaild data is not required then dispose children
            if ( this._unloadInvisible ) {
                box.disposeChildren( this._statistics );
            }
        }

        if ( box.status !== PointCloud.Box.Status.DESTROYED ) {
            // [parent]
            //    |--a1--[box]
            //    |--a2--[C]
            //    |--a3-- x
            //    `--a4-- x
            //    - box が読み込まれている場合 box を描画する。
            //    - box の読み込みが完了するまでは、Aがa1領域を描画する(読み込み中は枠のみ描画される場合があるため、box も描画する)。
            // @ts-ignore
            this._pushBox( box, undefined, box_ppp, parent_ppp );
            if ( box.status === PointCloud.Box.Status.LOADING || box.status === PointCloud.Box.Status.NOT_LOADED ) {
                const parent = box.parent;
                if ( parent ) {
                    this._pushBox( parent, parent.indexOf(box), parent_ppp, parent_ppp );
                }
            }
            /*
            else {
                if ( !box_ppp ) {
                    console.log("unknown status");
                }
                else {
                    this._pushBox( box, undefined, box_ppp, parent_ppp );
                }
            }
            */
        }
    }


    /**
     * スクリーン１画素あたりの点の数[points/pixel]を計算する。
     * 例えば、2画素につき1点の間隔で並んでいる場合は 0.5 を返す。
     * @param box Box
     */
    private _calcPointsPerPixel( box: PointCloud.Box ) {
        const is_plane = box.eigenVectorLength[0] < box.size * 0.8;
        let points_per_pixel;

        if ( is_plane && this._dispersion && box.eigenVectorLength[0] > 0 ) {
            const dir = GeoMath.normalize3( this._view_dir_wU, GeoMath.createVector3f() );

            const [ ev1,  ev2,  ev3  ] = box.eigenVector;
            const [ ev1l, ev2l, ev3l ] = box.eigenVectorLength;
            const n = GeoMath.createVector3([
                    GeoMath.dot3(ev2, dir),
                    GeoMath.dot3(ev1, dir),
                    GeoMath.dot3(ev3, dir)
            ]);
            const s = (n[0] * n[0]) / (ev2l * ev2l) + (n[2] * n[2]) / (ev3l * ev3l);
            const nn = GeoMath.createVector3([
                    s * ev3l * ev1l / ev2l * n[0],
                    s * ev2l * ev3l / ev1l * n[1],
                    s * ev1l * ev2l / ev3l * n[2]
            ]);
            GeoMath.normalize3(nn, nn);
            const area_calc = (nn[0] * n[0] + nn[1] * n[1] + nn[2] * n[2]) * (
                Math.PI * ev1l * ev2l * ev3l /
                Math.sqrt(nn[0] * nn[0] * ev2l * ev2l + nn[1] * nn[1] * ev1l * ev1l + nn[2] * nn[2] * ev3l * ev3l)
            );
            const area = Math.min(Math.max(area_calc, 0.05 * box.proj_area), box.proj_area);
            points_per_pixel = Math.sqrt( box.vertex_length / area );
        }
        else {
            points_per_pixel = 64 / box.size; // (128 / (2*box.size)) = 1セルの大きさ（点の間隔）
        }

        const diff = GeoMath.createVector3([
                box.gocs_center[0] + box.average[0] - this._view_pos_Q[0],
                box.gocs_center[1] + box.average[1] - this._view_pos_Q[1],
                box.gocs_center[2] + box.average[2] - this._view_pos_Q[2]
        ]);

        // ω スクリーン上の１画素の一辺の長さを、box.averageの位置に投影した長さ
        const ω = GeoMath.dot3( this._view_dir_wU, diff );
        return ω * points_per_pixel;
    }


    /**
     * 描画対象を追加
     * 
     * @param box
     * @param targetChild cell領域を指定する場合は数字、全体を描画する場合はnullを指定する
     * @param ppp 描画時の解像度 (points per pixel)
     * @param parent_ppp 親Boxの描画時の解像度 (points per pixel)
     */
    private _pushBox( box: PointCloud.Box, target_child: number | undefined, ppp: number, parent_ppp: number ) {
        let ro = this._render_boxes_map.get( box );
        if ( ro ) {
            if ( target_child === undefined ) ro.setWholeRegion( ppp );
            else ro.pushRegion( target_child, ppp );
        }
        else {
            const diff = GeoMath.createVector3(box.is_loaded ?
                [
                    box.gocs_center[0] + box.average[0] - this._view_pos_Q[0],
                    box.gocs_center[1] + box.average[1] - this._view_pos_Q[1],
                    box.gocs_center[2] + box.average[2] - this._view_pos_Q[2]
                ]:
                [
                    box.gocs_center[0] - this._view_pos_Q[0],
                    box.gocs_center[1] - this._view_pos_Q[1],
                    box.gocs_center[2] - this._view_pos_Q[2]
                ]
            );
            const distance = Math.sqrt(diff[0]*diff[0] + diff[1]*diff[1] + diff[2]*diff[2]);
            ro = new PointCloudBoxRenderObject( box, distance, parent_ppp );
            if ( target_child === undefined ) ro.setWholeRegion( ppp );
            else ro.pushRegion( target_child, ppp );
            this._render_boxes.push( ro );
            this._render_boxes_map.set( box, ro );

            if ( box.status === PointCloud.Box.Status.NOT_LOADED ) {
                this._pushLoadBox( ro );
            }
        }
    }


    /**
     * 描画対象として追加
     */
    private _pushLoadBox( ro: PointCloudBoxRenderObject ) {
        const compareFunc = (ro1: PointCloudBoxRenderObject, ro2: PointCloudBoxRenderObject) => ro1.parent_points_per_pixel < ro2.parent_points_per_pixel;
        const index = this._binarySearch( this._load_boxes, ro, compareFunc );
        // this._load_boxes.splice( index, 0, ro );
        if ( index === -1) this._load_boxes.push(ro);
        else this._insert_with_limit( this._load_boxes, index, ro, this._load_limit );
    }


    /**
     */
    private _insert_with_limit( list: PointCloudBoxRenderObject[], index: number, item: PointCloudBoxRenderObject, limit: number ) {
        if ( limit === undefined || limit - list.length > 0) {
            list.splice( index, 0, item );
        }
        else {
            // we couldn't increase the size
            if (index === list.length) return;
            for ( let i=list.length-1; i>index; i-- ) {
                list[i] = list[i-1];
            }
            list[index] = item;
        }
    }


    /**
     * @param Array<T> sorted_list ソート済みリスト
     */
    private _binarySearch( sorted_list: PointCloudBoxRenderObject[], value: PointCloudBoxRenderObject, compareFunc: BSCompareFunc<PointCloudBoxRenderObject> ) {
        if ( sorted_list.length === 0 ) return -1;
        if ( compareFunc( value, sorted_list[ 0 ] ) ) return 0;
        if ( compareFunc( sorted_list[sorted_list.length - 1], value ) ) return sorted_list.length;
        if ( sorted_list.length === 1 ) return sorted_list.length;
        return this._binarySearchInner( sorted_list, value, compareFunc, 0, sorted_list.length - 1 );
    }


    /**
     */
    private _binarySearchInner( sorted_list: PointCloudBoxRenderObject[], value: PointCloudBoxRenderObject, compareFunc: BSCompareFunc<PointCloudBoxRenderObject>, min: number, max: number ): number {
        if ( max - min === 1 ) return max;
        const mid = 0.5 * (min + max) | 0;
        if ( compareFunc( sorted_list[mid], value ) ) min = mid;
        else max = mid;
        return this._binarySearchInner( sorted_list, value, compareFunc, min, max );
    }


    /**
     */
    private _collectNextLevel( box: PointCloud.Box, parent_ppp: number ) {
        let child: PointCloud.Box | undefined;
        for ( let i=0; i<8; i++ ) {
            if ( child = box.newChild( i, this._statistics ) ) {
                this._updateBox( child, parent_ppp );
            }
        }
    }
}



type BSCompareFunc<T> = (obj1: T, obj2: T) => boolean;



/**
 * Boxの解像度の状態を表す列挙型
 * @see PointCloud.Box.status
 */
export enum LodStatus {
    /**
     * 目標解像度に達しておらず、次のレベルのBoxを読み込む必要があることを示しす。
     */
    LOAD_NEXT_LEVEL,

    /**
     * 読み込み中などの理由で解像度が計算できないため、現状を維持することを示す。
     */
    KEEP_STATUS,

    /**
     * 目標解像度に達しており、次のレベルのBoxが必要ないことを示す。
     */
    UNLOAD_NEXT_LEVEL,
};



export default PointCloudBoxCollector;
