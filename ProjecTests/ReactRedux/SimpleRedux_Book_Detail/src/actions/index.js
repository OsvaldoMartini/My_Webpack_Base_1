export function selectBook(book) {
    console.log('A book has been selected', book.title);
    // So We Want to basically enhance our action create right here
    // So return a usable action
    
    // selectBook is An ActionCreator, it needs to return an Action
    // Return Our Action, an object with a type property
    return {
        type: 'BOOK_SELECTED', //Mandatory
        payload: book          //Not Mandadory 
    };
}

