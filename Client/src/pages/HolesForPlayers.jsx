import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { scoreCardResults } from "../api/scorecardresult.api";

import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  Button,
  Input,
  Select,
  SelectSection,
  SelectItem,
} from "@nextui-org/react";
import { setScoreCard } from "../api/scorecard.api";

export function HolesForScorecards({ onclose, setRefetch }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm();
  const navigate = useNavigate();
  const params = useParams();
  const onSubmit = handleSubmit(async (data) => {
    try {
      // Crear un arreglo de promesas con los fetch de cada stroke
      const promises = Array.from({ length: 9 }).map((_, i) => {
        // Construir la url con el número de stroke y la cantidad
        const url = `http://localhost:5001/api/ScorecardResults/${params.scoreId}/${i + 1}`;
        // Enviar los datos con fetch y devolver la promesa
        console.log(url);
        return fetch(url, { method: "Put", body: JSON.stringify({strokes:data[`strokes${i + 1}`]}), headers: { "Content-Type": "application/json" } });
      });
      
      await Promise.all(promises);
      // Mostrar un mensaje de éxito
      toast.success("Updated Scorecard succesfully");
      navigate(`/tournaments/${params.id}`);
    } catch (error) {
      // Manejar el error
    }
  });
  

  const cambiarValor = () => {
    setRefetch(true);
  };

  useEffect(() => {
    async function loadScorecard() {
      for (let i = 1; i <= 9; i++) {
        const res = await scoreCardResults(params.id, i);
        setValue(`strokes${i}`, res.data.strokes);
      }
    }
    loadScorecard();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
    <h1 className="text-2xl font-bold">Scorecard</h1>
    <br/>
    
    <form onSubmit={onSubmit}>
    <div className=" overflow-y-auto h-80 gap-4">
         {Array.from({ length: 18 }).map((_, i) => (
           <div className="p-2 border flex-1" key={i}>
             <Input
               type="number"
               label={`stroke${i + 1}`}
               placeholder={errors.strokes ? "Required" : ""}
               {...register(`strokes${i + 1}`, { required: true })}
             /> 
        </div>
      ))}
  
      <div className="flex justify-center col-span-6 mt-4">
        </div>
      </div>
      <br/>
        <Button color="primary" type="submit" onClick={setScoreCard(params.id)}>
          Save
        </Button>
    </form>
  </div>
  
  );
}
