import * as React from 'react';
import { Scene } from '@esri/react-arcgis';
import BermudaTriangle from './BermudaTriangle'; // The Graphic component we just made

export default (props) => (
    <div style={{ width: '100vw', height: '100vh' }}>
        <Scene class="full-screen-map">
            <BermudaTriangle />
        </Scene>
    </div>
)