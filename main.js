let books = [];
const RENDER_EVENT = 'render-book';
const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'BOOK_APPS';

function isStorageExist() {
    if (typeof Storage === undefined) {
        alert('Browser Anda tidak mendukung, silahkan ganti browser lain');
        return false;
    }

    return true;
}

function saveData() {
    if (isStorageExist()) {
        const parsed = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY, parsed);
        document.dispatchEvent(new Event(SAVED_EVENT));
    }
}

function generateId() {
    return +new Date();
}

function generateBookObject(id, judul, penulis, tahun, sudahSelesai) {
    return { id, judul, penulis, tahun, sudahSelesai };
}

function findBook(bookId) {
    for (const bookItem of books) {
        if (bookItem.id === bookId) {
            return bookItem;
        }
    }
}

function findBookIndex(bookId) {
    for (const index in books) {
        if (books[index].id === bookId) {
            return index;
        }
    }

    return -1;
}

function addBook() {
    const textJudul = document.getElementById('inputJudulBuku').value;
    const textPenulis = document.getElementById('inputPenulisBuku').value;
    const textTahun = document.getElementById('inputTahunBuku').value;
    const sudahSelesai = document.getElementById('inputBukuSudahSelesai').checked;

    const generateID = generateId();
    const bookObject = generateBookObject(generateID, textJudul, textPenulis, textTahun, sudahSelesai);

    books.push(bookObject);

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function addBookToCompleted(bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    bookTarget.sudahSelesai = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function deleteBookFromCompleted(bookId) {
    const bookTarget = findBookIndex(bookId);

    if (bookTarget === -1) return;

    books.splice(bookTarget, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function undoBookFromCompleted(bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    bookTarget.sudahSelesai = false;
    document.dispatchEvent(new Event(RENDER_EVENT));

    saveData();
}

function searchBooks() {
    const judul = document.getElementById('searchJudulBuku').value;

    const searchedBook = books.filter(function (book) {
        const bookTarget = book.judul.toLowerCase();

        return bookTarget.includes(judul.toLowerCase());
    });

    return searchedBook;
}

function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);

    let data = JSON.parse(serializedData);

    if (data !== null) {
        for (const book of data) {
            books.push(book);
        }
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
}

function makeBook(bookObject) {
    const textJudul = document.createElement('h3');
    textJudul.innerText = bookObject.judul;

    const textPenulis = document.createElement('p');
    textPenulis.innerText = `Penulis: ${bookObject.penulis}`;

    const textTahun = document.createElement('p');
    textTahun.innerText = `Tahun: ${bookObject.tahun}`;

    const article = document.createElement('article');
    article.classList.add('book_item');
    article.append(textJudul, textPenulis, textTahun);
    article.setAttribute('id', `${bookObject.id}`);

    const changeButton = document.createElement('button');
    changeButton.classList.add('green');

    if (bookObject.sudahSelesai) {
        changeButton.innerText = 'Belum selesai dibaca';
        changeButton.addEventListener('click', function () {
            undoBookFromCompleted(bookObject.id);
        });
    } else {
        changeButton.innerText = 'Selesai dibaca';
        changeButton.addEventListener('click', function () {
            addBookToCompleted(bookObject.id);
        });
    }

    const deleteButton = document.createElement('button');
    deleteButton.classList.add('red');
    deleteButton.innerText = 'Hapus buku';
    deleteButton.addEventListener('click', function () {
        if (confirm('Apakah Anda yakin ingin menghapus data buku?')) {
            deleteBookFromCompleted(bookObject.id);
        } else {
            return;
        }
    });

    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('action');
    buttonContainer.append(changeButton, deleteButton);

    article.append(buttonContainer);

    return article;
}

document.addEventListener('DOMContentLoaded', function () {
    const formSubmit = document.getElementById('inputBuku');
    const searchSubmit = document.getElementById('searchBuku');
    const spanFormSubmit = document.querySelector('#inputBuku span');
    const completeCheckbox = document.getElementById('inputBukuSudahSelesai');

    formSubmit.addEventListener('submit', function (event) {
        event.preventDefault();
        addBook();
    });

    searchSubmit.addEventListener('submit', function (event) {
        event.preventDefault();
        searchBooks();
        document.dispatchEvent(new Event(RENDER_EVENT));
    });

    completeCheckbox.addEventListener('change', function () {
        spanFormSubmit.innerText = '';
        if (this.checked) {
            spanFormSubmit.innerText = 'Selesai dibaca';
        } else {
            spanFormSubmit.innerText = 'Belum selesai dibaca';
        }
    });

    if (isStorageExist()) {
        loadDataFromStorage();
    }
});

document.addEventListener(RENDER_EVENT, function () {
    const uncompletedBookList = document.getElementById('incompleteBookshelfList');
    uncompletedBookList.innerText = '';

    const completedBookList = document.getElementById('completeBookshelfList');
    completedBookList.innerText = '';

    for (const bookItem of searchBooks()) {
        const bookElement = makeBook(bookItem);
        if (!bookItem.sudahSelesai) uncompletedBookList.append(bookElement);
        else completedBookList.append(bookElement);
    }
});

document.addEventListener(SAVED_EVENT, function () {
    console.log(localStorage.getItem(STORAGE_KEY));
});
