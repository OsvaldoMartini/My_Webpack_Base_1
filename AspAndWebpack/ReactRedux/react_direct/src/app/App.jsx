import React from 'react';
import {Button} from 'primereact/components/button/Button';
import {Menu} from 'primereact/components/menu/Menu';

export default class App extends React.Component {
    
    constructor(props) {
        super(props);
        this.state = {
          locale: 'en'
        };
    }
    
    render() {
        
        let menu_items;
        let button_label;
        if(this.state.locale === 'en') {
          menu_items = [
            { label: 'Label1_en' },
            { label: 'Label2_en' }
          ];
          
          button_label = 'button_label_en';
        } else {
          menu_items = [
            { label: 'Label1_tr' },
            { label: 'Label2_tr' }
          ];
          
          button_label = 'button_label_tr';
        }
        return (
          <div className="App">
            <Menu model={menu_items} /><br/>
            <Button label={button_label} onClick={() => this.handleSwitch()}/>
          </div>
          
        );
    }
    
    handleSwitch() {
       this.setState({locale: this.state.locale === 'en' ? 'tr' : 'en'});
    }
}