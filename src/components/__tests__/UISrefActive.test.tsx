import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import * as React from 'react';
import { makeTestRouter } from '../../__tests__/util';
import { ReactStateDeclaration } from '../../index';
import { UISref, UISrefActive, UIRouter } from '../../components';

const states: ReactStateDeclaration[] = [
  { name: 'parent', url: '/parent' },
  { name: 'parent.child1', url: '/child1' },
  { name: 'parent.child2', url: '/child2' },
  { name: 'withParams', url: '/with?param' },
];

describe('<UISrefActive>', () => {
  let { router, routerGo, mountInRouter } = makeTestRouter([]);
  beforeEach(() => ({ router, routerGo, mountInRouter } = makeTestRouter(states)));

  function UISrefActiveTestComponent(props: {
    to?: string;
    activeClass?: string;
    params?: object;
    exact?: boolean;
    testid?: string;
  }) {
    const { to = 'parent', activeClass = 'active', exact = false, params, testid = 'anchor' } = props;
    return (
      <UISrefActive class={activeClass} exact={exact}>
        <UISref to={to} params={params}>
          <a data-testid={testid} className="baseclass" />
        </UISref>
      </UISrefActive>
    );
  }

  it('renders its child', async () => {
    const rendered = mountInRouter(<UISrefActiveTestComponent to="parent.child1" />);
    const anchor = rendered.getByTestId('anchor');
    expect(anchor.getAttribute('href')).toBe('/parent/child1');
  });

  it('updates class for child <UISref>', async () => {
    const rendered = mountInRouter(<UISrefActiveTestComponent to="parent.child1" />);
    expect(await rendered.findAllByRole('link')).toHaveLength(1);
    expect(rendered.getByTestId('anchor').getAttribute('class')).toBe('baseclass');

    await routerGo('parent.child1');
    expect(await rendered.findAllByRole('link')).toHaveLength(1);
    expect(rendered.getByTestId('anchor').getAttribute('class')).toBe('active baseclass');

    await routerGo('parent.child2');
    expect(await rendered.findAllByRole('link')).toHaveLength(1);
    expect(rendered.getByTestId('anchor').getAttribute('class')).toBe('baseclass');
  });

  it('registers onSuccess transition hook to listen for state changes', async () => {
    const onSuccessSpy = vi.spyOn(router.transitionService, 'onSuccess');
    mountInRouter(<UISrefActiveTestComponent />);
    expect(onSuccessSpy).toHaveBeenCalled();
  });

  it('deregisters the transition hook when unmounted', async () => {
    const deregisterSpy = vi.fn();
    vi.spyOn(router.transitionService, 'onSuccess').mockImplementation(() => deregisterSpy);
    const Component = () => {
      const [show, setShow] = React.useState(true);
      return (
        <div>
          <button data-testid="btn" onClick={() => setShow(false)}>
            hide
          </button>
          {show && <UISrefActive />}
        </div>
      );
    };

    const rendered = mountInRouter(<Component />);
    expect(deregisterSpy).not.toHaveBeenCalled();
    rendered.getByTestId('btn').click();
    await waitFor(() => expect(deregisterSpy).toHaveBeenCalled());
  });

  it('works with state parameters', async () => {
    await routerGo('withParams', { param: 5 });
    const rendered = mountInRouter(<UISrefActiveTestComponent to="withParams" params={{ param: 5 }} />);
    expect(rendered.getByTestId('anchor').getAttribute('class')).toBe('active baseclass');

    await routerGo('withParams', { param: 3 });
    expect(rendered.getByTestId('anchor').getAttribute('class')).toBe('baseclass');
  });

  it('applies the active class when any nested <UISref> is active', async () => {
    const rendered = mountInRouter(
      <UISrefActive class="active">
        <div className="baseclass" data-testid="div">
          <UISref to="parent.child1">
            <a data-testid="child1">child1</a>
          </UISref>
          <UISref to="parent.child2">
            <a data-testid="child2">child2</a>
          </UISref>
        </div>
      </UISrefActive>
    );

    const divClass = () => rendered.getByTestId('div').getAttribute('class').split(/ +/).sort().join(' ');

    await routerGo('parent.child1');
    expect(divClass()).toBe('active baseclass');

    await routerGo('parent.child2');
    expect(divClass()).toBe('active baseclass');

    await routerGo('parent.child2');
    expect(divClass()).toBe('active baseclass');

    await routerGo('parent');
    expect(divClass()).toBe('baseclass');
  });

  it('works with nested <UISrefActive>', async () => {
    const rendered = mountInRouter(
      <UISrefActive class="active">
        <div className="baseclass" data-testid="div">
          <UISrefActive class="child1">
            <UISref to="parent.child1">
              <a data-testid="child1">child1</a>
            </UISref>
          </UISrefActive>
          <UISrefActive class="child2">
            <UISref to="parent.child2">
              <a data-testid="child2">child2</a>
            </UISref>
          </UISrefActive>
        </div>
      </UISrefActive>
    );

    const classFor = (testid: string) =>
      rendered.getByTestId(testid).getAttribute('class').split(/ +/).sort().join(' ');

    await routerGo('parent');
    expect(classFor('div')).toBe('baseclass');
    expect(classFor('child1')).toBe('');
    expect(classFor('child2')).toBe('');

    await routerGo('parent.child1');
    expect(classFor('div')).toBe('active baseclass');
    expect(classFor('child1')).toBe('child1');
    expect(classFor('child2')).toBe('');

    await routerGo('parent.child2');
    expect(classFor('div')).toBe('active baseclass');
    expect(classFor('child1')).toBe('');
    expect(classFor('child2')).toBe('child2');
  });

  it('passes down className from parent correctly', async () => {
    const rendered = mountInRouter(
      <UISrefActive class="parent">
        <UISrefActive class="child">
          <UISref to="parent.child1">
            <a className="baseclass" data-testid="anchor">
              child1
            </a>
          </UISref>
        </UISrefActive>
      </UISrefActive>
    );

    const classFor = (testid: string) =>
      rendered.getByTestId(testid).getAttribute('class').split(/ +/).sort().join(' ');

    await routerGo('parent.child1');
    expect(classFor('anchor')).toBe('baseclass child parent');

    await routerGo('parent');
    expect(classFor('anchor')).toBe('baseclass');
  });

  it('removes active state if underlying UISref is unmounted', async () => {
    const Comp = () => {
      const [show, setShow] = React.useState(true);
      const sref = show ? (
        <UISref to="parent.child1">
          <a>child1</a>
        </UISref>
      ) : null;

      return (
        <UIRouter router={router}>
          <button data-testid="hidebtn" onClick={() => setShow(false)} />
          <UISrefActive class="active">
            <div className="baseclass" data-testid="div">
              {sref}
            </div>
          </UISrefActive>
        </UIRouter>
      );
    };

    await routerGo('parent.child1');
    const rendered = render(<Comp />);

    const classFor = (testid: string) =>
      rendered.getByTestId(testid).getAttribute('class').split(/ +/).sort().join(' ');

    expect(classFor('div')).toBe('active baseclass');

    rendered.getByTestId('hidebtn').click();
    await waitFor(() => expect(classFor('div')).toBe('baseclass'));
  });

  it('checks for exact state match when exact prop is provided', async () => {
    const rendered = mountInRouter(
      <>
        <UISrefActiveTestComponent activeClass="fuzzy" testid="fuzzy" to="parent" />
        <UISrefActiveTestComponent activeClass="exact" testid="exact" to="parent" exact={true} />
      </>
    );

    const classFor = (testid: string) =>
      rendered.getByTestId(testid).getAttribute('class').split(/ +/).sort().join(' ');

    await routerGo('parent.child1');
    expect(classFor('fuzzy')).toBe('baseclass fuzzy');
    expect(classFor('exact')).toBe('baseclass');

    await routerGo('parent');
    expect(classFor('fuzzy')).toBe('baseclass fuzzy');
    expect(classFor('exact')).toBe('baseclass exact');
  });
});
