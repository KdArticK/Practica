document.addEventListener('DOMContentLoaded', () => {
    const librosList = document.getElementById('libros-list');
    const editBookForm = document.getElementById('edit-book-form');
    const editIdInput = document.getElementById('edit-id');
    const editTituloInput = document.getElementById('edit-titulo');
    const editAutorInput = document.getElementById('edit-autor');
    const editFechaPublicacionInput = document.getElementById('edit-fecha_publicacion');
    const cancelEditButton = document.getElementById('cancel-edit');

    async function fetchLibros() {
        try {
            const response = await fetch('/libros');
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const libros = await response.json();
            console.log('Datos recibidos:', libros); // Agrega este console.log
            displayLibros(libros);
        } catch (err) {
            console.error('Error al cargar libros:', err);
        }
    }
    

    document.getElementById('add-book-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        try {
            await fetch('/libros', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            fetchLibros();
            e.target.reset(); // Limpia el formulario después de añadir
        } catch (err) {
            console.error('Error al añadir libro:', err);
        }
    });

    window.editLibro = function(id, titulo, autor, fecha_publicacion) {
        editIdInput.value = id;
        editTituloInput.value = titulo;
        editAutorInput.value = autor;
        editFechaPublicacionInput.value = fecha_publicacion;
        editBookForm.style.display = 'block';
    };

    editBookForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        try {
            await fetch(`/libros/editar/${data.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            fetchLibros();
            editBookForm.style.display = 'none';
        } catch (err) {
            console.error('Error al editar libro:', err);
        }
    });

    cancelEditButton.addEventListener('click', () => {
        editBookForm.style.display = 'none';
    });

    window.deleteLibro = async function(id) {
        try {
            await fetch(`/libros/eliminar/${id}`, { method: 'POST' });
            fetchLibros();
        } catch (err) {
            console.error('Error al eliminar libro:', err);
        }
    };

    fetchLibros();
});
