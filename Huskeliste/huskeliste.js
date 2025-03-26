// få reference til beholder, ul-elementerne samt input-form
const beholderen = document.querySelector('.beholder');
const ulElementer = document.querySelectorAll('.ulElementer');
const main1Liste = document.querySelector('#main1UL');
const main2Liste = document.querySelector('#main2UL');

indlæsHusketing();


// tilføj event-håndtering på begge forms, lægges på parent-div
// eventhåndtering bobler op til øvre element
beholderen.addEventListener('submit', e => {
    // prevent gør at siden ikke automatisk opfriskes ved submit-event
    e.preventDefault();

    // tjek først hvilken af de to formularer man har fat i
    if (e.target.id === "input1") {
        const form1 = document.querySelector('#input1');
        const husketing = form1.nyTing.value.trim();
        const nyListItem = document.createElement("li");
        nyListItem.textContent = husketing;
        main1Liste.append(nyListItem);  //tilføj ny ting til rette huskeliste
    }
    else if (e.target.id === "input2") {
        const form2 = document.querySelector('#input2');
        const husketing = form2.nyTing.value.trim();
        console.log(main2Liste);
        const nyListItem = document.createElement("li");
        nyListItem.textContent = husketing;
        main2Liste.append(nyListItem);
    }
});

ulElementer.forEach((ul) => {
    ul.addEventListener('click', e => {
        const klikketElement = e.target;
        if (klikketElement.tagName === "LI") {
            const style = window.getComputedStyle(klikketElement);
            if(style.textDecoration.includes("line-through")){
                klikketElement.remove();
            } 
            else{
                console.log("overstreg")
                klikketElement.style.textDecoration = "line-through";
                klikketElement.style.textDecorationColor = 'red';
            }            
        }
    });
});


// kaldes fra gem-knappen
function gemLokalt() {
    console.log("gem lokalt");
    // lav objekt literal med to forskellige arrays til hver liste
    const huskeObjekt = { huskeliste1: [], huskeliste2: [] };
    let list1 = document.querySelectorAll('#main1UL li');
    let list2 = document.querySelectorAll('#main2UL li');

    // løber igennem begge nodelist af li-elementer
    // putter dem i rette array på huske-objektet
    list1.forEach((ting) => {
        huskeObjekt.huskeliste1.push(ting.innerText);
    });
    list2.forEach((ting) => {
        huskeObjekt.huskeliste2.push(ting.innerText);
    });
    // gem objektet som json-data i localstorage, i browseren på tværs af sessioner
    // husketing er nøglen til json-dataen
    localStorage.setItem('husketing', JSON.stringify(huskeObjekt));
    console.log(localStorage.getItem('husketing'));
}

// hent ekisterende husketing fra sidste session, hvis noget
function indlæsHusketing() {
    // konverter json-strengen til et js-objekt
    const huskeObjekt = JSON.parse(localStorage.getItem('husketing'));
    // tilføj ting i de to liste-arrays til DOM-træet som li-element
    if (huskeObjekt !== false) {
        huskeObjekt.huskeliste1.forEach((ting) => {
            const nyListItem = document.createElement("li");
            nyListItem.textContent = ting;
            main1Liste.append(nyListItem);
        });
        huskeObjekt.huskeliste2.forEach((ting) => {
            const nyListItem = document.createElement("li");
            nyListItem.textContent = ting;
            main2Liste.append(nyListItem);
        });
    }
}