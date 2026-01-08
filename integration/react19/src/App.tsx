import { UIRouter, UIView, UISref, hashLocationPlugin } from '@uirouter/react';

const Home = () => (
  <div>
    <h1 data-testid="home-title">Home Page</h1>
    <p>Welcome to the UI-Router React 19 sample app!</p>
  </div>
);

const About = () => (
  <div>
    <h1 data-testid="about-title">About Page</h1>
    <p>This is a simple sample application.</p>
  </div>
);

const states = [
  { name: 'home', url: '/home', component: Home },
  { name: 'about', url: '/about', component: About },
];

const App = () => (
  <UIRouter plugins={[hashLocationPlugin]} states={states}>
    <div>
      <nav>
        <UISref to="home">
          <a data-testid="home-link">Home</a>
        </UISref>
        {' | '}
        <UISref to="about">
          <a data-testid="about-link">About</a>
        </UISref>
      </nav>
      <hr />
      <UIView />
    </div>
  </UIRouter>
);

export default App;
