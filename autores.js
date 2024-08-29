document.addEventListener('DOMContentLoaded', () => {
    const autoresList = document.getElementById('autores-list');
    const editAuthorForm = document.getElementById('edit-author-form');
    const editIdInput = document.getElementById('edit-id');
    const editNombreInput = document.getElementById('edit-nombre');
    const editApellidoInput = document.getElementById('edit-apellido');
    const editFechaNacimientoInput = document.getElementById('edit-fecha_nacimiento');
    const cancelEditButton = document.getElementById('cancel-edit');

    async function fetchAutores() {
        try {
            const res = await fetch('/autores');
            const autores = await res.json();
            autoresList.innerHTML = autores.map(a => `
                <tr>
                    <td>${a.id}</td>
                    <td>${a.nombre}</td>
                    <td>${a.apellido}</td>
                    <td>${a.fecha_nacimiento}</td>
                    <td>
                        <button onclick="editAutor(${a.id}, '${a.nombre}', '${a.apellido}', '${a.fecha_nacimiento}')">Editar</button>
                        <button onclick="deleteAutor(${a.id})">Eliminar</button>
                    </td>
                </tr>
            `).join('');
        } catch (err) {
            console.error('Error al cargar autores:', err);
        }
    }

    document.getElementById('add-author-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        try {
            await fetch('/autores', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            fetchAutores();
            e.target.reset(); // Limpia el formulario después de añadir
        } catch (err) {
            console.error('Error al añadir autor:', err);
        }
    });

    window.editAutor = function(id, nombre, apellido, fecha_nacimiento) {
        editIdInput.value = id;
        editNombreInput.value = nombre;
        editApellidoInput.value = apellido;
        editFechaNacimientoInput.value = fecha_nacimiento;
        editAuthorForm.style.display = 'block';
    };

    editAuthorForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        try {
            await fetch(`/autores/${data.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            fetchAutores();
            editAuthorForm.style.display = 'none';
        } catch (err) {
            console.error('Error al editar autor:', err);
        }
    });

    cancelEditButton.addEventListener('click', () => {
        editAuthorForm.style.display = 'none';
    });

    window.deleteAutor = async function(id) {
        try {
            await fetch(`/autores/${id}`, { method: 'DELETE' });
            fetchAutores();
        } catch (err) {
            console.error('Error al eliminar autor:', err);
        }
    };

    fetchAutores();
});
