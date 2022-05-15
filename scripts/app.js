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

    // Bind Unavailable Toggle link
    let toggle = { state: true };
    
    document.querySelector(`#unavailableview`).addEventListener('click', (event) => {
        event.preventDefault();
        toggleUnavailable(toggle);
        return false;
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

    // Bind CheckStatus click
    document.getElementById(`checkStatus`).addEventListener(`click`, (event) => {
        event.preventDefault();

        checkStatus();

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

const toggleUnavailable = (toggle) => {
    if (toggle.state) {
        Array.from(document.querySelectorAll(`#songqueue tr:not([status="not available"])`)).forEach(item => {
            item.classList.add("hide");
        });
        toggle.state = false

        return;
    }

    Array.from(document.querySelectorAll(`#songqueue tr.hide`)).forEach(item => {
        item.classList.remove("hide");
    });

    toggle.state = true
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

function* chunks(arr, n) {
    for (let i = 0; i < arr.length; i += n) {
      yield arr.slice(i, i + n);
    }
  }

const checkStatus = async () => {

    document.querySelector(`#ytSongs .count`).textContent = document.querySelectorAll(`#songqueue tbody tr.yt`).length + ` `;
    document.querySelector(`#scSongs .count`).textContent = document.querySelectorAll(`#songqueue tbody tr.sc`).length + ` `;

    let allSongs = document.querySelectorAll(`#songqueue tbody tr.yt`)
    allSongs.forEach((song, index) => {
        song.setAttribute(`status`, `not available`);
      });

    let videoIDs = Array(...document.querySelectorAll(`#songqueue tbody tr.yt`)).map( (item) => item.getAttribute(`id`) );
    let videoIDsChunks = [...chunks(videoIDs, 50)];

    videoIDsChunks.forEach( (chunk) => {
        let videoList = chunk.join(`,`);

        fetch('/songstatus', {
            headers: { "Content-Type": "application/json; charset=utf-8" },
            method: 'POST',
            body: JSON.stringify({
                videoIDs: videoList
            })
        })
        .then( (res) => res.json() )
        .then( (data) => {            
            data.forEach((item) => {
                if (item.status.uploadStatus.toLowerCase() === `processed`) {
                    if (item.status.privacyStatus.toLowerCase() === `public`) {
                        document.getElementById(item.id).setAttribute(`status`, `available`)
                    }
                    else {
                        document.getElementById(item.id).setAttribute(`status`, `not available`)
                    }
                }
                else {
                    document.getElementById(item.id).setAttribute(`status`, `not available`)
                }
            });
        });
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