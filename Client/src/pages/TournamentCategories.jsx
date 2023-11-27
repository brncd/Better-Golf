import {  getAllTournamentCategories, deleteCategoriesInTournament, getAllScorecardsInTournament } from '../api/tournaments.api';
import { DeleteIcon } from "../assets/DeleteIcon";
import { Table, TableHeader, TableBody, TableRow, TableCell, TableColumn } from "@nextui-org/react";
import { Tooltip } from "@nextui-org/react";
import { useEffect, useState } from 'react';
import { Button } from '@nextui-org/react';
import { useParams, useNavigate } from 'react-router-dom';
import { set } from 'react-hook-form';

export function TournamentCategories() {
  const [categories, setcategories] = useState([]);
  const [scorecard, setScorecard] = useState([]); //
  const [refetch, setRefetch] = useState(true);
  const params = useParams(); // para obtener el id de la url 
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchcategories() {
      if (params.id) {
      const categories = await getAllTournamentCategories(params.id);
      setcategories(categories.data);
      await getAllScorecardsInTournament(params.id);
      setScorecard(scorecard.data);
      setRefetch(false);
      }
    }
    if (refetch){
    fetchcategories();
    }
  }, [refetch]);
 
  return (
    <div>
      <div className="flex flex-col gap-3">
      <Table
        color={"primary"}
        selectionMode="single"
        defaultSelectedKeys={["3"]}
        aria-label="Example static collection table"
      >
        <TableHeader>
          
          <TableColumn>Name</TableColumn> 
          <TableColumn>Sex</TableColumn>
          <TableColumn>Count</TableColumn>
          <TableColumn>Actions</TableColumn>
        </TableHeader>
        <TableBody>
            {categories.map((categorie) => (
            <TableRow key={categorie.id}>
              <TableCell>{categorie.name}</TableCell>
              
              <TableCell>{categorie.sex}</TableCell>
              <TableCell>{categorie.count}</TableCell>
              <TableCell>
                <div className="relative flex items-center gap-2">
            
                  <Tooltip color="danger" content="Delete">
                    <span className="text-lg text-danger cursor-pointer active:opacity-50">
                      <DeleteIcon
                        onClick={async () => {
                          await deleteCategoriesInTournament(params.id, categorie.id);
                         setRefetch(true);
                        }}
                      />
                    </span>
                  </Tooltip>
                </div>
              </TableCell>
            </TableRow>
        ))}
        </TableBody>
      </Table>
    </div>
    
  </div>
  );

}
