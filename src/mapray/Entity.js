import GeoMath from "./GeoMath";


/**
 * @summary シーン・エンティティ
 * @classdesc
 * <p>シーン・エンティティの基底クラスである。</p>
 * @memberof mapray
 * @see mapray.Scene
 * @protected
 * @abstract
 */
class Entity {

    /**
     * @desc
     * <p>インスタンス生成後に、それを scene に追加することができる。</p>
     *
     * @param {mapray.Scene} scene  所属可能シーン
     * @param {object} [opts]       オプション集合
     * @param {object} [opts.json]  生成情報
     * @param {object} [opts.refs]  参照辞書
     */
    constructor( scene, opts )
    {
        /**
         * @summary 所属可能シーン
         * @member mapray.Entity#scene
         * @type {mapray.Scene}
         * @readonly
         */
        this.scene = scene;
    }


    /**
     * @summary プリミティブ配列を取得
     * @desc
     * <p>レンダリング時にこのエンティティを描画するための 0 個以上のプリミティブを含む配列を返す。</p>
     * <p>このメソッドが呼び出されたフレームのレンダリングが終了するまで、返した配列とそれに含まれるプリミティブは変更してはならない。</p>
     *
     * @param  {mapray.RenderStage} stage  レンダリングステージ
     * @return {Array.<mapray.Primitive>}  プリミティブ配列
     * @abstract
     * @package
     */
    getPrimitives( stage )
    {
        throw new Error( "mapray.Entity#getPrimitives() method has not been overridden." );
    }


    /**
     * @summary プロパティ集合の読み込み
     * @desc
     * <p>json.properties をプロパティ集合 props に読み込む。</p>
     * @param  {object}       json     生成情報
     * @param  {object}       refs     参照辞書
     * @param  {mapray.PropSet} [props]  格納先プロパティ集合 (指定がなければ生成される)
     * @return {mapray.PropSet}          プロパティ集合
     * @package
     */
    loadProperties( json, refs, props )
    {
        var src_props = json.properties || {};
        var dst_props = props || {};
        var  prop_ids = Object.keys( src_props );

        for ( var i = 0; i < prop_ids.length; ++i ) {
            var  pid = prop_ids[i];
            var pval = src_props[pid];

            if ( pval.type == "tex-2d" ) {
                // テクスチャ
                dst_props[pid] = refs[pval.ref_texture];
            }
            else if ( Array.isArray( pval ) ) {
                // ベクトル
                dst_props[pid] = new Float32Array( pval );
            }
            else {
                // その他
                dst_props[pid] = pval;
            }
        }

        return dst_props;
    }

}


export default Entity;
