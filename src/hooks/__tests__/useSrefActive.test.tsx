import { beforeEach, describe, expect, it } from 'vitest';
import * as React from 'react';
import { makeTestRouter } from '../../__tests__/util';
import { useSrefActive } from '../useSrefActive';

const parent = { name: 'parent', url: '/parent' };
const child = { name: 'parent.child', url: '/child' };
const other = { name: 'other', url: '/other' };

describe('useUiSrefActive', () => {
  let { router, routerGo, mountInRouter } = makeTestRouter([]);
  beforeEach(() => ({ router, routerGo, mountInRouter } = makeTestRouter([parent, child, other])));

  it('returns the activeClass if the state is active', async () => {
    const Component = () => {
      const uiSref = useSrefActive('parent', null, 'active');
      return <a {...uiSref}>parent</a>;
    };
    await routerGo('other');
    const wrapper = mountInRouter(<Component />);
    expect(wrapper.container.innerHTML).toBe('<a href="/parent" class="">parent</a>');

    await routerGo('parent');
    expect(wrapper.container.innerHTML).toBe('<a href="/parent" class="active">parent</a>');
  });

  it('returns the activeClass if a child state is active', async () => {
    const Component = () => {
      const uiSref = useSrefActive('parent', null, 'active');
      return <a {...uiSref}>parent</a>;
    };
    await routerGo('other');
    const wrapper = mountInRouter(<Component />);
    expect(wrapper.container.innerHTML).toBe('<a href="/parent" class="">parent</a>');

    await routerGo('parent.child');
    expect(wrapper.container.innerHTML).toBe('<a href="/parent" class="active">parent</a>');
  });
});
