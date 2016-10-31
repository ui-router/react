import './services';
import UIRouterReact from "./core";

export {trace} from "ui-router-core";
export {ReactStateDeclaration} from "./interface";

export {browserHistory} from "./history/browserHistory";
export {hashHistory} from "./history/hashHistory";

export {UIView} from "./components/UIView";
export {UISref} from "./components/UISref";
export {UISrefActive} from "./components/UISrefActive";

export default UIRouterReact;