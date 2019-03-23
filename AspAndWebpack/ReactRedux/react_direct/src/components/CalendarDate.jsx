import React from 'react';
import ReactDom from 'react-dom';

import {Calendar} from 'primereact/components/calendar/Calendar';
//I am Setting Local
//import {Calendar} from 'primereact/components/Calendar';

export default class CalendarDate extends React.Component {
    constructor(props) {
      super(props);
    }
    
    render() {
      return (
        <div className="CalendarDate">
          <div>
            <Calendar dateFormat={'M/dd/yy'}
                      value={new Date()}>
            </Calendar>
          </div>
        </div>
      )
    }
  }
  