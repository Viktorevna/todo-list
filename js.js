const $input = document.querySelector('#input')
const $todos = document.querySelector('#todos-container')

const HASH = "894d7823266659e776dc4fd5c694e302"
const todoURL = 'http://brotheroftux.org:8080/todos/' + HASH

$input.addEventListener('keyup', function(event) {
    if (event.code === 'Enter' ) {
        if ($input.value.trim()) {
            StateModule.dispatch("addTodo", $input.value)
            $input.value = ""
        }
    }
})

function addTodo(Todo, indexTodo) {
    let text = Todo.text
    const item = document.createElement('div')
    const todo = document.createElement('div')
    const control = document.createElement('div')
    const cross = document.createElement('div')
    const edit = document.createElement('div')
    const todoId = parseInt(indexTodo)

    item.classList.add('item')
    item.id = todoId
    todo.classList.add('todo')
    control.classList.add('control')
    cross.classList.add('cross')
    edit.classList.add('edit')
    todo.textContent = text
    item.appendChild(todo)
    item.appendChild(control)
    control.appendChild(edit)
    control.appendChild(cross)
    $todos.appendChild(item)

    function FocusEnd(element)
    {
        element.focus();
        if (typeof window.getSelection != "undefined"
                && typeof document.createRange != "undefined") {
            let range = document.createRange();
            range.selectNodeContents(element);
            range.collapse(false);
            let sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
        } else if (typeof document.body.createTextRange != "undefined") {
            var textRange = document.body.createTextRange();
            textRange.moveToElementText(el);
            textRange.collapse(false);
            textRange.select();
        }
    }

    function SaveEdit(editpar, todopar, todoIdpar )
    {
        editpar.className = 'edit'
        todopar.className = 'todo'
        todopar.setAttribute("contenteditable", "false")
        StateModule.nosubdispatch("editTodo", {
            newTodoText: todopar.textContent, 
            indexTodo: parseInt(todoIdpar)
        }) 
    }

    function StartEdit(editpar, todopar)
    {
        editpar.className = 'ok'
        todopar.classList.add('todo_edit')
        todopar.setAttribute("contenteditable", "true")
        FocusEnd(todopar)
    }

    edit.addEventListener('click', function(){
        if (edit.className === 'edit') {
            StartEdit(edit, todo)
            const $items = $todos.querySelectorAll(".item")
            $items.forEach($item => {
                if (parseInt($item.id) !== parseInt(item.id)) {
                    $edit = $item.querySelector('.ok')
                    if ($edit !== null) {
                        $todo = $item.querySelector('.todo')
                        SaveEdit($edit, $todo, $item.id)
                    }
                }
            })
        }
        else {
            SaveEdit(edit,todo,todoId) 
        }
    })
    todo.addEventListener('keypress', function(event){
        if (event.keyCode === 13) {
            if (edit.className === 'ok') {
                SaveEdit(edit, todo, todoId)  
            }
        }
    })
    cross.addEventListener('click', function() {
        StateModule.dispatch("removeTodo", todoId)
    })
    if (Todo.done) {
        todo.classList.add('done')
        edit.remove()
    }
    todo.addEventListener('click', function(){
        if (edit.className === 'edit')
            StateModule.dispatch("doneTodo", todoId)
    })
}

function serverGetRequest(callback) {
    const xhr = new XMLHttpRequest()
    xhr.open('GET', todoURL)
    xhr.onreadystatechange = () => {
        if (xhr.readyState === XMLHttpRequest.DONE &&
        xhr.status === 200) {
            const JSONString = JSON.parse(xhr.responseText)
            callback(JSONString)
        }
    }
    xhr.send()
}

function serverAddRequest(todoText, callback) {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', todoURL)
    xhr.setRequestHeader('Content-Type', 'text/plain')
    xhr.onreadystatechange = () => {
        if (xhr.readyState === XMLHttpRequest.DONE &&
        xhr.status === 200) {
            const JSONString = JSON.parse(xhr.responseText)
            callback(JSONString)
        }
    }
    xhr.send(JSON.stringify({
        text: todoText,
        done: false
    }))
}

function serverDoneRequest(indexTodo, callback) {
    const xhr = new XMLHttpRequest()
    xhr.open('PUT', todoURL)
    xhr.setRequestHeader('Content-Type', 'text/plain')
    xhr.onreadystatechange = () => {
        if (xhr.readyState === XMLHttpRequest.DONE &&
        xhr.status === 200) {
            const JSONString = JSON.parse(xhr.responseText)
            callback(JSONString)
        }
    }
    const doneTodo = !StateModule.state.todos[indexTodo].done
    xhr.send(JSON.stringify({
        index: indexTodo,
        done: doneTodo
    }))
}

function serverEditRequest(indexTodo, newText, callback) {
    const xhr = new XMLHttpRequest()
    xhr.open('PUT', todoURL)
    xhr.setRequestHeader('Content-Type', 'text/plain')
    xhr.onreadystatechange = () => {
        if (xhr.readyState === XMLHttpRequest.DONE &&
        xhr.status === 200) {
            const JSONString = JSON.parse(xhr.responseText)
            callback(JSONString)
        }
    }
    xhr.send(JSON.stringify({
        index: indexTodo,
        text: newText
    }))
}

function serverDeleteRequest(indexTodo, callback) {
    const xhr = new XMLHttpRequest()
    xhr.open('DELETE', todoURL)
    xhr.setRequestHeader('Content-Type', 'text/plain')
    xhr.onreadystatechange = () => {
        if (xhr.readyState === XMLHttpRequest.DONE &&
        xhr.status === 200) {
            const JSONString = JSON.parse(xhr.responseText)
            callback(JSONString)
        }
    }
    xhr.send(JSON.stringify({
        index: indexTodo
    }))
}

const StateModule = {
    state: {
        todos:[]
    },
    mutations: {
        addTodo:(state, todoText) => {
            let todo = {
                text: todoText,
                done: false
            }
            state.todos.push(todo)
        },
        initTodos:(state, todos) =>
        {
            state.todos = todos
        },
        removeTodo:(state, indexTodo) => {
            state.todos.splice(indexTodo, 1)
        },
        doneTodo:(state, indexTodo) => {
            state.todos[indexTodo].done = !state.todos[indexTodo].done
        },
        editTodo:(state, argument) => {
            state.todos[argument.indexTodo].text = argument.newTodoText
        }
    },
    subscribers:[],
    subscribe(cb) {
        this.subscribers.push(cb)
    },
    commit(mutation, payload) {
        this.mutations[mutation](this.state, payload)
        this.subscribers.forEach(cb => cb(this.state))
    },
    nosubcommit(mutation, payload) {
        this.mutations[mutation](this.state, payload)
    },
    actions: {
        addTodo: (context, todoText) => {
            serverAddRequest(todoText, response => {
                if (!response.error) context.commit('addTodo', todoText)
            })
        },
        doneTodo: (context, indexTodo) => {
            serverDoneRequest(indexTodo, response => {
                if (!response.error) context.commit('doneTodo', indexTodo)
            })
        },
        editTodo: (context, argument) => {
            serverEditRequest(argument.indexTodo, argument.newTodoText, response => {
                if (!response.error) context.commit('editTodo', argument)
            })
        },
        removeTodo: (context, indexTodo) => {
            serverDeleteRequest(indexTodo, response => {
                if (!response.error) context.commit('removeTodo', indexTodo)
            })
        },
        initTodos: (context, empty) => {
            serverGetRequest(response => {
                if (!response.error) {
                    context.commit('initTodos', response.response)
                }
            })
        }
    },
    dispatch (action, payload) {
        const context = {
            commit: this.commit.bind(this),
            state: this.state
        }
    
        this.actions[action](context, payload)
    },
    nosubdispatch (action, payload) {
        const context = {
            commit: this.nosubcommit.bind(this),
            state: this.state
        }
    
        this.actions[action](context, payload)
    }
}

function render(st) {
    $todos.textContent = ""
    for (let i=0; i<st.todos.length; i++) {
        addTodo(st.todos[i], i)
    }
}

StateModule.subscribe(render)

StateModule.dispatch('initTodos')