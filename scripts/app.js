const ready = () => {
    // Bind Top links
    Array.from(document.querySelectorAll(`.top`)).forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            movesong(link.getAttribute(`data-index`), `0`);
            return false;
        });
    });

    // Bind Bottom links
    Array.from(document.querySelectorAll(`.bottom`)).forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            movesong(link.getAttribute(`data-index`),document.querySelectorAll('#songqueue .song').length - 1);
            return false;
        });
    });

    // Bind Add links
    Array.from(document.querySelectorAll(`.add`)).forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            addsong(link.getAttribute(`data-songid`));
            window.location.replace('/');
            return false;
        });
    });

    // Bind Delete links
    Array.from(document.querySelectorAll(`.delete`)).forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            if (confirm("Are you sure you want to delete this song from you queue?")) {
                deletesong(link.getAttribute(`data-index`))
                .then( (res) => res.json() )
                .then( (data) => {
                    if (data === `refresh`) {
                        window.location.reload();
                    }
                });
            }
            return false;
        });
    });

    // Bind Search click
    document.getElementById(`search`).addEventListener(`click`, (event) => {
        event.preventDefault();
        let searchValue = document.getElementById(`songsearch`).value.trim();

        if (searchValue) {
            findsongs(searchValue);
        }

        return false;
    });

    
    if (typeof dragula !== `undefined`) {
        dragula([document.querySelector('#songqueue tbody')])
        .on(`drop`, (el, target, source, sibling) => {
            oldIndex = el.getAttribute(`data-index`);
            newIndex = [...el.parentElement.children].indexOf(el);
            movesong(oldIndex, newIndex);
        })
    }
}

const movesong = (indexFrom, indexTo) => {
    fetch('/movesong', {
        headers: { "Content-Type": "application/json; charset=utf-8" },
        method: 'POST',
        body: JSON.stringify({
            indexFrom: indexFrom,
            indexTo: indexTo,
        })
    })
    .then( (res) => res.json() )
    .then( (data) => {
        if (data === `refresh`) {
            window.location.reload();
        }
    });
}

const findsongs = (searchquery) => {
    window.location.replace('/findsong?' + new URLSearchParams({
        term: searchquery
    }));
}

const addsong = (songid) => {
    return fetch('/addsong?' + new URLSearchParams({
        songid: songid
    }));
}

const deletesong = (songindex) => {
    return fetch('/deletesong?' + new URLSearchParams({
        songindex: songindex
    }));
}

document.addEventListener('DOMContentLoaded', ready);