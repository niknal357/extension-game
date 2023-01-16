setTimeout(){

}

document.addEventListener('DOMContentLoaded', function() {
        ready();
      
    }
);

function ready() { 
    let gnomeButton = document.getElementById('gnome-dex')

        gnomeButton.addEventListener('click',
            function(){
                document.getElementById('gnome-dex').classList.toggle('gnome-dex-hidden')
            }
        );
}