const $input = document.querySelector('#input')
$input.addEventListener('keyup', function(event) {
    if (event.code === 'Enter' ) {
        if ($input.value !== "") {
            const $todos = document.querySelector('#todos-container')
            const item = document.createElement('div')
            const todo = document.createElement('div')
            const cross = document.createElement('div')
            item.classList.add('item')
            todo.classList.add('todo')
            cross.classList.add('cross')
            todo.textContent = $input.value
            item.appendChild(todo)
            item.appendChild(cross)
            $todos.appendChild(item)
            cross.textContent = "⨯"
            cross.addEventListener('click', function() {
                item.remove()
            })
            $input.value = "" 
            todo.addEventListener('click', function(){
                if (todo.className === "todo done") {
                    todo.className = "todo"
                }
                else {
                    todo.classList.add('done')
                }
            })
        }
    }
})
