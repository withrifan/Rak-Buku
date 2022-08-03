let books = [];
const RENDER_EVENT = 'render-book';
const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'BOOK_APPS';

function isStorageExist() {
    if (typeof Storage === undefined) {
        alert('Browser Anda tidak mendukung local storage');
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

function generateBookObject(id, judul, penulis, tahun, isCompleted) {
    return { id, judul, penulis, tahun, isCompleted };
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
    const isCompleted = document.getElementById('inputBookIsComplete').checked;

    const generateID = generateId();
    const bookObject = generateBookObject(generateID, textJudul, textPenulis, textTahun, isCompleted);

    books.push(bookObject);

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function addBookToCompleted(bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    bookTarget.isCompleted = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function removeBookFromCompleted(bookId) {
    const bookTarget = findBookIndex(bookId);

    if (bookTarget === -1) return;

    books.splice(bookTarget, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function undoBookFromCompleted(bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    bookTarget.isCompleted = false;
    document.dispatchEvent(new Event(RENDER_EVENT));

    saveData();
}

function searchBooks() {
    const judul = document.getElementById('searchBookTitle').value;

    const serializedData = localStorage.getItem(STORAGE_KEY);
    const data = JSON.parse(serializedData);
    const searchedBooks = data.filter(function (book) {
        return book.judul.toLowerCase().includes(judul);
    });

    if (searchedBooks.length === 0) {
        alert('Buku Anda tidak ditemukan!');
        return location.reload();
    }

    if (judul !== '') {
        books = [];
        for (const book of searchedBooks) {
            books.push(book);
        }

        document.dispatchEvent(new Event(RENDER_EVENT));
    } else {
        books = [];
        loadDataFromStorage();
    }
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

    const undoButton = document.createElement('button');
    undoButton.classList.add('green');

    if (bookObject.isCompleted) {
        undoButton.innerText = 'Belum selesai dibaca';
        undoButton.addEventListener('click', function () {
            undoBookFromCompleted(bookObject.id);
        });
    } else {
        undoButton.innerText = 'Selesai dibaca';
        undoButton.addEventListener('click', function () {
            addBookToCompleted(bookObject.id);
        });
    }

    const trashButton = document.createElement('button');
    trashButton.classList.add('red');
    trashButton.innerText = 'Hapus buku';
    trashButton.addEventListener('click', function () {
        if (confirm('Yakin Anda ingin menghapus data buku?')) {
            removeBookFromCompleted(bookObject.id);
        } else {
            return;
        }
    });

    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('action');
    buttonContainer.append(undoButton, trashButton);

    article.append(buttonContainer);

    return article;
}

document.addEventListener('DOMContentLoaded', function () {
    const submitForm = document.getElementById('inputBook');
    const searchSubmit = document.getElementById('searchBook');
    const spanSubmitForm = document.querySelector('#inputBook span');
    const completeCheckbox = document.getElementById('inputBookIsComplete');

    submitForm.addEventListener('submit', function (event) {
        event.preventDefault();
        addBook();
    });

    searchSubmit.addEventListener('submit', function (event) {
        event.preventDefault();
        searchBooks();
    });

    completeCheckbox.addEventListener('change', function () {
        spanSubmitForm.innerText = '';
        if (this.checked) {
            spanSubmitForm.innerText = 'Selesai dibaca';
        } else {
            spanSubmitForm.innerText = 'Belum selesai dibaca';
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

    for (const bookItem of books) {
        const bookElement = makeBook(bookItem);
        if (!bookItem.isCompleted) uncompletedBookList.append(bookElement);
        else completedBookList.append(bookElement);
    }
});

document.addEventListener(SAVED_EVENT, function () {
    console.log(localStorage.getItem(STORAGE_KEY));
});
