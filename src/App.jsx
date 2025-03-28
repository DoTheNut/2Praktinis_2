import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useParams } from "react-router-dom";
import axios from "axios";
// npm install axios ;; npm install json-server --save-dev
const API_URL = "https://dummyjson.com/recipes";
const FAVORITES_URL = "http://localhost:3001/favorites";

const RecipeList = () => {
    const [recipes, setRecipes] = useState([]);
    const [page, setPage] = useState(1);

    useEffect(() => {
        axios.get(API_URL).then((res) => setRecipes(res.data.recipes));
    }, []);

    const displayedRecipes = recipes.slice((page - 1) * 5, page * 5);

    return (
        <div>
            <h1>Receptų sąrašas</h1>
            {displayedRecipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
            <button disabled={page === 1} onClick={() => setPage(page - 1)}>Atgal</button>
            <button disabled={page * 5 >= recipes.length} onClick={() => setPage(page + 1)}>Kitas</button>
        </div>
    );
};

const RecipeCard = ({ recipe }) => {
    const [isFavorite, setIsFavorite] = useState(false);

    useEffect(() => {
        axios.get(FAVORITES_URL).then((res) => {
            setIsFavorite(res.data.some((fav) => fav.id === recipe.id));
        });
    }, [recipe.id]);

    const toggleFavorite = () => {
        if (isFavorite) {
            // Pašalinti iš mėgstamiausių
            axios.delete(`${FAVORITES_URL}/${recipe.id}`).then(() => {
                setIsFavorite(false);
                alert('Receptas pašalintas iš mėgstamiausių!');
            }).catch((err) => {
                console.error("Klaida pašalinant iš mėgstamiausių:", err);
            });
        } else {
            // Pridėti prie mėgstamiausių
            axios.post(FAVORITES_URL, recipe).then(() => {
                setIsFavorite(true);
                alert('Receptas pridėtas prie mėgstamiausių!');
            }).catch((err) => {
                console.error("Klaida pridedant prie mėgstamiausių:", err);
            });
        }
    };


    return (
        <div>
            <h3>{recipe.name}</h3>
            <Link to={`/recipe/${recipe.id}`}>Žiūrėti detaliau</Link>
            <button onClick={toggleFavorite}>{isFavorite ? "❤️" : "🤍"}</button>
        </div>
    );
};

const RecipeDetail = () => {
    const { id } = useParams();
    const [recipe, setRecipe] = useState(null);

    useEffect(() => {
        axios.get(`${API_URL}/${id}`).then((res) => setRecipe(res.data));
    }, [id]);

    if (!recipe) return <p>Kraunama...</p>;

    return (
        <div>
            <h1>{recipe.name}</h1>
            <p>{recipe.instructions}</p>
            <Link to="/">Grįžti</Link>
        </div>
    );
};

const FavoritesPage = () => {
    const [favorites, setFavorites] = useState([]);

    useEffect(() => {
        axios.get(FAVORITES_URL).then((res) => setFavorites(res.data));
    }, []);

    return (
        <div>
            <h1>Mėgstamiausi receptai</h1>
            {favorites.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
            <Link to="/">Grįžti</Link>
        </div>
    );
};

const App = () => {
    return (
        <Router>
            <nav>
                <Link to="/">Pagrindinis</Link>
                <Link to="/favorites">Mėgstamiausi</Link>
            </nav>
            <Routes>
                <Route path="/" element={<RecipeList />} />
                <Route path="/recipe/:id" element={<RecipeDetail />} />
                <Route path="/favorites" element={<FavoritesPage />} />
            </Routes>
        </Router>
    );
};

export default App;
