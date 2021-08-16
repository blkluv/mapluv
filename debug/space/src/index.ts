import '../../../packages/ui/dist/mapray.css';
import SpaceApp from './SpaceApp';

// 現在のアプリインスタンス
let appInstance: SpaceApp | undefined;


/**
 * アプリを開始
 * @param  {string|Element} container  コンテナ (ID または要素)
 */
export default function( container: HTMLElement | string )
{
    if ( appInstance ) {
        // すでに動作していれば停止して消去
        appInstance.destroy();
        appInstance = undefined;
    }
    appInstance = new SpaceApp( container );
}
