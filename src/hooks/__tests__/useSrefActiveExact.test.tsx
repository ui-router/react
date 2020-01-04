import * as React from 'react';
import { makeTestRouter } from '../../__tests__/util';
import { useSrefActiveExact } from '../useSrefActiveExact';

const parent = { name: 'parent', url: '/parent' };
const child = { name: 'parent.child', url: '/child' };
const other = { name: 'other', url: '/other' };

describe('useUiSrefActiveExact', () => {
  let { router, routerGo, mountInRouter } = makeTestRouter([]);
  beforeEach(() => ({ router, routerGo, mountInRouter } = makeTestRouter([parent, child, other])));

  it('returns the activeClass if the state is active', async () => {
    const Component = () => {
      const uiSref = useSrefActiveExact('parent', null, 'active');
      return <a {...uiSref}>parent</a>;
    };
    await routerGo('other');
    const wrapper = mountInRouter(<Component />);
    expect(wrapper.html()).toBe('<a href="/parent" class="">parent</a>');

    await routerGo('parent');
    wrapper.update();
    expect(wrapper.html()).toBe('<a href="/parent" class="active">parent</a>');
  });

  it('does not return the activeClass if a child state is active', async () => {
    const Component = () => {
      const uiSref = useSrefActiveExact('parent', null, 'active');
      return <a {...uiSref}>parent</a>;
    };
    await routerGo('parent');
    const wrapper = mountInRouter(<Component />);
    expect(wrapper.html()).toBe('<a href="/parent" class="active">parent</a>');

    await routerGo('parent.child');
    wrapper.update();
    expect(wrapper.html()).toBe('<a href="/parent" class="">parent</a>');
  });
});
