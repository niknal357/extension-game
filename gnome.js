setTimeout(ready, 1000);

// document.addEventListener('DOMContentLoaded', function() {
//         ready();
      
//     }
// );

function ready() { 
    let gnomeButton = document.getElementById('gnome-dex-button')

    gnomeButton.addEventListener('click',
        function(){
            document.getElementById('gnome-dex').classList.toggle('gnome-dex-hidden')
        }
    );
}