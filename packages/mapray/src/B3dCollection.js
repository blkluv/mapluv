import B3dScene from "./B3dScene";
import WasmTool from "./WasmTool";
import b3dtile_base64 from "./wasm/b3dtile.wasm";


/**
 * @summary B3dScene を管理
 *
 * @memberof mapray
 * @private
 */
class B3dCollection {

    constructor()
    {
        this._tree_map = new Map();  // 辞書: B3dProvider -> B3dScene

        this._wa_module = null;

        this._shader_cache = {};

        this._loadWasmModule();
    }


    /**
     * シェーダをキャッシュするための特殊なプロパティ
     *
     * @type {object}
     * @readonly
     *
     * @package
     */
    get shader_cache() { return this._shader_cache; }


    /**
     * @summary wasm モジュールを取得
     *
     * B3dScene が必要とする wasm モジュールを返す。まだモジュールがロードされていない
     * ときは null を返す。
     *
     * @return {?WebAssembly.Module}
     *
     * @package
     */
    getWasmModule() { return this._wa_module; }


    /**
     * @summary b3dtile wasm モジュールの生成
     *
     * b3dtile wasm モジュールの生成を開始する。
     *
     * モジュールの生成が完了したとき this._wa_module を設定する。
     *
     * その後、各 B3dScene インスタンスに通知する。
     *
     * @private
     */
    _loadWasmModule()
    {
        WasmTool.createModuleByBese64( b3dtile_base64 )
            .then( wa_module => {
                // this に本来のオブジェクトを設定
                this._wa_module = wa_module;

                // wasm ロード中に追加された B3dScene インスタンスに wasm が
                // ロードされたことを通知
                for ( let tree of this._tree_map.values() ) {
                    tree.onLoadWasmModule();
                }
            } )
            .catch( e => {
                // エラーは想定していない
            } );
    }


    /**
     * @summary すべての B3dScene インスタンスを削除
     */
    clear()
    {
        for ( let provider of Array.from( this._tree_map.keys() ) ) {
            this.remove( provider );
        }
    }


    /**
     * @summary B3dScene インスタンスを追加
     *
     * @param {mapray.B3dProvider} provider  B3dScene に対応するプロバイダ
     */
    add( provider )
    {
        if ( this._tree_map.has( provider ) ) {
            // すでに存在する場合は何もしない
            return;
        }

        this._tree_map.set( provider, new B3dScene( this, provider ) );
    }


    /**
     * @summary B3dScene インスタンスを削除
     *
     * provider に対応する B3dScene インスタンスを this からから削除する。
     * そのとき B3dScene インスタンスに対して cancel() を呼び出す。
     *
     * @param {mapray.B3dProvider} provider  B3dScene に対応するプロバイダ
     */
    remove( provider )
    {
        let tree = this._tree_map.get( provider );
        if ( tree === undefined ) {
            // 存在しない場合は何もしない
            return;
        }

        tree.cancel();

        this._tree_map.delete( provider );
    }


    /**
     * @summary すべての B3D タイルの描画
     *
     * @param {mapray.RenderStage} stage
     */
    draw( stage )
    {
        for ( let tree of this._tree_map.values() ) {
            tree.draw( stage );
        }
    }


    /**
     * @summary フレーム終了処理
     */
    endFrame()
    {
        for ( let tree of this._tree_map.values() ) {
            tree.endFrame();
        }
    }


    /**
     * @summary すべての B3D シーンとレイとの交点を探す
     *
     * @desc
     * <p>線分 (ray.position を始点とし、そこから ray.direction 方向に limit 距離
     * 未満にある点) と this 全体の三角形との交点の中で、始点から最も近い交点の情
     * 報を返す。ただし線分と交差する三角形が見つからないときは null を返す。</p>
     *
     * <p>戻り値のオブジェクト形式は次のようになる。ここで uint32 は 0 から
     *    2^32 - 1 の整数値である。</p>
     *
     * <pre>
     * {
     *     provider:   B3dProvider,
     *     distance:   number,
     *     feature_id: [uint32, uint32]
     * }
     * </pre>
     *
     * <p>戻り値のオブジェクトと、そこから参照できるオブジェクトは変更しても問
     *    題ない。</p>
     *
     * @param {mapray.Ray} ray  半直線を表すレイ (GOCS)
     * @param {number}   limit  制限距離 (ray.direction の長さを単位)
     *
     * @return {?object}  交点の情報
     */
    getRayIntersection( ray, limit )
    {
        let distance = limit;
        let   result = null;

        for ( let [provider, tree] of this._tree_map ) {

            const info = tree.getRayIntersection( ray, distance );
            if ( info === null ) continue;

            // provider の tree が交差した
            distance = info.distance;
            result   = {
                provider,
                distance,
                feature_id: info.feature_id  // 複製の必要はない
            };
        }

        return result;
    }

}


export default B3dCollection;
