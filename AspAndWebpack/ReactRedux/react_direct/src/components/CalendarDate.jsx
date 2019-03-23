import {Calendar} from 'primereact/components/calendar/Calendar';

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
  