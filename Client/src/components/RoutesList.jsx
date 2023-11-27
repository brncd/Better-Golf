import { Routes, Route } from "react-router-dom";
import { TournamentsPage } from "../pages/TournamentsPage";
import { TournamentsFormPage } from "../pages/TournamentsFormPage";
import { PlayersPage } from "../pages/PlayersPage";
import { PlayersFormPage } from "../pages/PlayersFormPage";
import { CoursesPage } from "../pages/CoursesPage";
import { CoursesFormPage } from "../pages/CoursesFormPage";
import { CategoriesFormPage } from "../pages/CategoriesFormPage";
import { TournamentandPLayer } from "../pages/TournamentAndPlayer";
import { PlayersListForTournament } from "./PlayersListForTournament";
import { TournamentPage } from "../pages/TournamentPageId";
import { CoursePageId } from "../pages/CoursePageId";
import { Categories } from "../pages/Categories";
import { TournamentCategoriesPage } from "../pages/TournamentAndCategories";
import { CategoryListForTournament } from "../components/CategoriesListForTournament";
import { AddHolesInCourse } from "../pages/AddHolesInCourse";
import { HolesFormUpdate } from "../pages/FormPageForUpdateHole";
import { HolesForScorecards } from "../pages/HolesForPlayers";

export function RoutesList() {
  return (
    <div className="flex-1 p-6 bg-zinc-200 dark:bg-black ">
      <Routes>
        <Route path="/" element={<TournamentsPage />} />
        <Route path="/tournaments" element={<TournamentsPage />} />
        <Route path="/tournaments-create" element={<TournamentsFormPage />} />
        <Route path="/tournaments/:id" element={<TournamentPage />} />
        <Route path="/tournaments/:id/edit" element={<TournamentsFormPage />} />
        <Route path="/tournaments/:id/players" element={<TournamentandPLayer />} />
        <Route path="/tournaments/:id/categories" element={<TournamentCategoriesPage />} />
        <Route path="/tournaments/:id/addCategory" element={<CategoryListForTournament />} />
        <Route path="/tournaments/:id/addplayers" element={<PlayersListForTournament />} />
        <Route path="/tournaments/:id/result/:scoreId" element={<HolesForScorecards />} />
        <Route path="/players" element={<PlayersPage />} />
        <Route path="/players-create" element={<PlayersFormPage />} />
        <Route path="/players/:id" element={<PlayersFormPage />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/courses/:id" element={<CoursePageId />} />
        <Route path="/courses/:id/holes" element={<AddHolesInCourse />} />
        <Route path="/courses/:courseid/EditHole/:holeId" element={<HolesFormUpdate />} />
        <Route path="/courses-create" element={<CoursesFormPage />} />
        <Route path="/categories/:id" element={<CategoriesFormPage />} />
        <Route path="/categories/" element={<Categories />} />
      </Routes>
    </div>
  );
}
