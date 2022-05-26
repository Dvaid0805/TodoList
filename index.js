function generateId() {
   return Math.floor(Math.random()    * (100 - 200 + 1)) + 100;
}

function makeRequest(method, url) {
   return new Promise (function (resolve, reject) {
      let xhr = new XMLHttpRequest();
      xhr.open(method, url);
      xhr.onload = function() {
         if(this.status >= 200 && this.status < 300) {
            resolve(xhr.response);
         } else {
            reject ({
               status: this.status,
               statusTest: xhr.statusText
            });
         }
      };
      xhr.onerror = function() {
         reject({
            status:this.status,
            statusText: xhr.statusText
         });
      };
      xhr.send();
   });
}

class TodoListItem {
   constructor(todo) {
      this.title = todo;
      this.id = generateId()
      this.userId = generateId()
      this.complete = false;
   }
}

class App {
   constructor(list = [], storageKey = 'myTodoAppList') {
      this._list = list;
      this._storage = storageKey;
      this._dom = document.querySelector('#app');
   }

   createTemplate() {
      const main = document.createElement('main');
      main.className = 'app-main';
      const formSection = document.createElement('section');
      formSection.className = 'app-main__block app-main__block--form';
      const listSection = document.createElement('section');
      listSection.className = 'app-main__block app-main__block--list';
      main.appendChild(formSection);
      main.appendChild(listSection);
      this._dom.appendChild(main);
   }

   createForm() {
      const form = document.createElement('form');
      form.className = 'app-form';
      const input = document.createElement('input');
      input.className = 'app-form__input';
      input.type = 'text';
      input.placeholder = 'Type todo item';
      input.required = true;
      const submitButton = document.createElement('button');
      submitButton.innerText = 'Add todo';
      submitButton.type = 'submit';
      form.appendChild(input);
      form.appendChild(submitButton);
      this._dom.querySelector('.app-main__block--form').appendChild(form);
      this._dom.querySelector('.app-form').addEventListener('submit', this.submitFormHandler.bind(this));
   }

   createList() {
      const list = document.createElement('ul');
      list.className = 'app-list';
      this._dom.querySelector('.app-main__block--list').appendChild(list);
      this._dom.querySelector('.app-list').addEventListener('click', this.clickListItemHandler.bind(this));
   }

   toggleListItemToggleDone(id) {
      const index = this._list.findIndex((item) => item.id === Number(id));
      this._list[index].completed = !this._list[index].completed;
      this.addToStorage();
   }

   deleteListItem(id) {
      const index = this._list.findIndex((item) => item.id === Number(id));
      this._list.splice(index, 1);
      this.addToStorage();
   }

   deleteListItemElement(id) {
      this._dom.querySelector('.app-list').removeChild(this._dom.querySelector(`li[data-id="${id}"]`))
   }

   clickListItemHandler(event) {
      const itemId = event.target.closest('li').dataset.id
      if (event.target.type === 'checkbox') {
         this.toggleListItemToggleDone(itemId);
      }
      if(event.target.type === 'submit') {
         this.deleteListItem(itemId);
         this.deleteListItemElement(itemId);
      }
   }

   createListItemElement(todoItem, type) {
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';

      if(todoItem.completed) {
         checkbox.checked = true;
      }

      const text = document.createElement('span');
      text.innerText = todoItem.title;

      const button = document.createElement('button');
      button.innerText = 'X';

      const listItem = document.createElement('li');
      listItem.className = 'app-list__item';
      listItem.setAttribute('data-id', todoItem.id);
      listItem.appendChild(checkbox);
      listItem.appendChild(text);
      listItem.appendChild(button);

      this._dom.querySelector('.app-list').appendChild(listItem);

      if(type === 'append') {
         this._dom.querySelector('.app-list').appendChild(listItem);
      } else {
         this._dom.querySelector('.app-list').prepend(listItem);
      }
   }

   addToList(todoItem) {
      this._list.unshift(todoItem);
      this.addToStorage();
   }

   submitFormHandler(event) {
      event.preventDefault();
      const newTodoItem = new TodoListItem(event.target[0].value);
      this.addToList(newTodoItem)
      this.createListItemElement(newTodoItem);
      event.target[0].value = '';
   }

   addToStorage(list = this._list) {
      localStorage.setItem(this._storageKey, JSON.stringify(this._list));
   }
   setStorage() {
      if(!localStorage.getItem(this._storageKey)) {
         this.addToStorage([]);
      }
   }

   async fetchTodos() {
      const result = await makeRequest('GET', 'https://jsonplaceholder.typicode.com/users/1/todos');
      return JSON.parse(result);
   }

   async readStorage() {
      const storageItems = JSON.parse(localStorage.getItem(this._storageKey));
      if(storageItems.length) {
         this._list = storageItems;
      } else {
         const todos = await this.fetchTodos();
         this._list = todos;
         this.addToStorage(todos);
      }
      this._list.forEach((todo) =>{
         this.createListItemElement(todo, 'append');
      })
   }



   async init() {
      this.createTemplate();
      this.createForm();
      this.createList();
      this.setStorage();
      await this.readStorage();
   }
}

const app = new App();

app.init();