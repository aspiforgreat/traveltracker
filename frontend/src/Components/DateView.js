import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; // Import styles

const DateView = () => {
    const [date, setDate] = useState(new Date());

    const onChange = (newDate) => {
        setDate(newDate);
    };

    return (
        <div className="calendar-container">
            <Calendar
                onChange={onChange}
                value={date}
                view="month" // This ensures the calendar view is set to month
            />
        </div>
    );
};

export default DateView;