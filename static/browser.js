/*global $*/

$(document).ready(function() {
    
    $('#suggestTitleButton').on('click', function(event) {
        event.preventDefault();
        var url = $('.urlFromForm').val();
        $.getJSON('/getTitle?url=' + url).then(function(response) {
            if (response.error) {
                response.status(500).send('sorry we could not process your request, please try again later');
            }
            else {
                $('#titleField').val(response.title);
            }
        });
    });

    $('#upvote').on('click', function(event){
        event.preventDefault();
        console.log('hey hello');
     
        //http://stackoverflow.com/questions/169506/obtain-form-input-fields-using-jquery   
        // https://api.jquery.com/serializeArray/
    });
    
    // $('#downvote').on('click', function(event){
    //     event.preventDefault();
    //     console.log('downnnvote');
    // })
    
});
