/** @packageDocumentation @reactapi @module react_hooks */

import { HookRegOptions, TransitionHookFn } from '@uirouter/core';
import { useStateContext } from './useStateContext';
import { useTransitionHook } from './useTransitionHook';

/**
 * A hook that can stop the router from exiting the state the hook is used in.
 *
 * This hook can be used to check preconditions before the router is allowed exit the state that the hook was used in.
 * If the hook returns true/undefined (or a Promise that resolves to true/undefined), the Transition will be allowed to continue.
 * If the hook returns false (or a Promise that resolves to false), the Transition will be cancelled.
 *
 * For example, you may use the hook in an edit screen.
 * If the user navigates to a different state which would exit the edit screen,
 * you may check for unsaved data and prompt for confirmation.
 *
 * Example:
 * ```jsx
 * function EditScreen(props) {
 *  const [initialValue, setInitialValue] = useState(props.initialValue);
 *  const [value, setValue] = useState(initialValue);
 *  const isDirty = useMemo(() => value !== initialValue, [value, initialValue]);
 *
 *  async function save() {
 *    await saveValue(value);
 *    setInitialValue(value); // reset initial value to current value
 *  }
 *
 *  useCanExit(() => {
 *    return isDirty ? window.confirm('Input is not saved. Are you sure you want to leave?') : true;
 *  });
 *
 *  return <div> <input type="text" value={value} onChange={setValue} /> <button onClick={save}>Save</button> </div>
 * }
 * ```
 *
 * Note that this hook adds a transition hook with [[HookMatchCriteria]] of ```{ exiting: thisState }```
 * where `thisState` is the state that the hook was rendered in.
 * See also: [[TransitionHookFn]]
 *
 * @param canExitCallback a callback that returns true/false, or a Promise for a true/false
 * @param options transition hook registration options
 */
export function useCanExit(canExitCallback: TransitionHookFn, options?: HookRegOptions) {
  const { routedState } = useStateContext();
  const stateName = routedState?.name;
  useTransitionHook('onBefore', { exiting: stateName }, canExitCallback, options);
}
