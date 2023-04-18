const dateFunctions = () => {

    return {

        startDate: function ( dayjs, theDate ) {
            if ( theDate ) {
                return dayjs.utc( theDate ).hour( 12 ).minute( 0 ).second( 0 );
            } else {
                return dayjs().utc().day( 3 ).subtract( 1, 'week' ).hour( 12 ).minute( 0 ).second( 0 ); // last Wednesday at 12
            }
        },

        endDate: function ( dayjs, theDate ) {
            if ( theDate ) {
                return dayjs.utc( theDate ).hour( 12 ).minute( 0 ).second( 0 );
            } else {
                return dayjs().utc().day( 3 ).hour( 12 ).minute( 0 ).second( 0 ); // next Wednesday at 12
            }
        },

        formStartDate: function ( dayjs, theDate ) {
            return this.formStartDate( dayjs, theDate ).format( 'DD/MM/YYYY' );
        },

        formEndDate: function ( dayjs, theDate ) {
            return this.formEndDate( dayjs, theDate ).format( 'DD/MM/YYYY' );
        },

        linkStartDate: function ( dayjs, theDate ) {
            return this.formStartDate( dayjs, theDate ).format( 'YYYY-MM-DD' );
        },

        linkEndDate: function ( dayjs, theDate ) {
            return this.formEndDate( dayjs, theDate ).format( 'YYYY-MM-DD' );
        },

        dbStartDate: function ( dayjs, theDate ) {
            return this.formStartDate( dayjs, theDate ).format( 'YYYY-MM-DD HH:mm:ss' );
        },

        dbEndDate: function ( dayjs, theDate ) {
            return this.formEndDate( dayjs, theDate ).format( 'YYYY-MM-DD HH:mm:ss' );
        },


    }
}

module.exports = dateFunctions;
