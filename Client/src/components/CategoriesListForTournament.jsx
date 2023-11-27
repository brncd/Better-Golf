
import { useEffect, useState } from "react";
import { getAllCategory } from "../api/categories.api";
import { Table, TableHeader, TableBody, TableColumn, TableRow, TableCell, Tooltip, Button } from "@nextui-org/react";
import { EditIcon } from "../assets/EditIcon";
import {Link, useNavigate, useParams } from "react-router-dom";


import { addcategorieToTournament } from "../api/tournaments.api";
import { AddIcon } from "../assets/AddIcon";

export function CategoryListForTournament( ) {
// Creamos una variable para guardar las categorías originales
const params = useParams()
const navigate = useNavigate()
const [newFilteredCategory, setnewFilteredCategory] = useState([]);
const [Category, setCategory] = useState([])

useEffect(() => {
  async function loadCategory() {
      const res = await getAllCategory();
      
      setCategory(res.data);
      setnewFilteredCategory(Category);
    }
  
  loadCategory();
  }, []);

  const handleCategoryClick = (categoryId) => {
    const FilteredCategory = newFilteredCategory.filter((category) => category.id !== categoryId);
    setnewFilteredCategory(FilteredCategory);
  }

return (
  <div className="flex flex-col gap-3 w-3/4 ml-16">
    <Table
      color={"primary"}
      selectionMode="single"
      defaultSelectedKeys={["3"]}
      aria-label="Example static collection table"
    >
      <TableHeader>
        <TableColumn className="text-xl" >Category</TableColumn>
        <TableColumn className="text-xl">Actions</TableColumn>
      </TableHeader>
      <TableBody>
        {newFilteredCategory.map((category) => (
          <TableRow key={category.id}>
            <TableCell>{category.name}</TableCell>
            <TableCell>
              <div className="relative flex items-center gap-2">
                <Tooltip content="Add category" color="succes">
                  <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                    <AddIcon
                      onClick={async () => {
                        addcategorieToTournament(params.id, category.id);
                        handleCategoryClick(category.id);
                      
                      }}
                      className="w-6 h-6 text-zinc-400  hover:bg-amber-600 active:bg-red-800"
                    />
                  </span>
                </Tooltip>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
    
    <Button
      variant="shadow"
      color="success"
      onClick={async () => {navigate(`/tournaments/${params.id}/categories`)}} 
       className="bg-myColor-200 dark:bg-teal-500 dark:hover:bg-teal-400 dark:text-white font-bold py-3 px-6 rounded w-1/6 transition transform active:shake  ">
         Go Back
         </Button>
  </div>
);

}

