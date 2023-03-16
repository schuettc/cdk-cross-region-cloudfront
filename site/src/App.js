import React from 'react';
import { Config } from './Config';

const App = () => {
    return (
        <div>
            <h1> Region Deployed to: {Config.siteRegion}</h1>
        </div>
    );
};
export default App;
