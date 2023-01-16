setTimeout(ready, 1000);


function ready() { 
    let gnomeButton = document.getElementById('gnome-dex-button')

    gnomeButton.addEventListener('click',
        function(){
            document.getElementById('gnome-dex').classList.toggle('gnome-dex-hidden');
            document.getElementById('gnome-dex-button').classList.toggle('gnome-dex-button-toggled');
        }
    );

    fetch('gnomes.txt')
        .then(response => response.text())
        .then(text => generateGnomeDex(text))
}

function generateGnomeDex(data){
    // get rid of new lines in data
    data = data.replace(/(\r\n|\n|\r)/gm, "");
    console.log(data);

    let lines = data.split(';');
    let linesPerGnomeEntry = 3;
    let numGnomes = Math.floor(lines.length / linesPerGnomeEntry);

    for (let i = 0; i < numGnomes; i++){
        let gnome = document.createElement('div');
        gnome.classList.add('gnome');

        let gnomeImage = document.createElement('img');
        gnomeImage.classList.add('gnome-image');
        gnomeImage.src = './gnomes/Level ' + (i + 1) + '.png';
        gnome.appendChild(gnomeImage);

        let gnomeNameDescriptionContainer = document.createElement('div');
        gnomeNameDescriptionContainer.classList.add('gnome-description-container');
        gnome.appendChild(gnomeNameDescriptionContainer);

        let gnomeName = document.createElement('h2');
        gnomeName.classList.add('gnome-name');
        gnomeName.innerHTML = lines[i * linesPerGnomeEntry + 1];
        gnomeNameDescriptionContainer.appendChild(gnomeName);

        let gnomeDescription = document.createElement('h3');
        gnomeDescription.classList.add('gnome-description');
        gnomeDescription.innerHTML = lines[i * linesPerGnomeEntry + 2];
        gnomeNameDescriptionContainer.appendChild(gnomeDescription);

        gnome.appendChild(gnomeNameDescriptionContainer);
        document.getElementById('gnome-dex').appendChild(gnome);
    }
}