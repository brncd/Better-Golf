import { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  createPlayer,
  deletePlayer,
  updatePlayer,
  getPlayerById,
} from "../api/players.api";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  Button,
  Input,
  Select,
  SelectSection,
  SelectItem,
} from "@nextui-org/react";

export function PlayersFormPage({ onclose, setRefetch }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm();
  const navigate = useNavigate();
  const params = useParams();
  const onSubmit = handleSubmit(async (data) => {
    if (params.id) {
      await updatePlayer(params.id, data);
      toast.success("Updated player succesfully"), navigate("/players");
    } else {
      await createPlayer(data);
      cambiarValor();
      toast.success("Player created succesfully");
    }
  });
  const cambiarValor = () => {
    setRefetch(true);
  };

  useEffect(() => {
    async function loadPlayer() {
      if (params.id) {
        const res = await getPlayerById(params.id);
        console.log(res.data);
        setValue("name", res.data.name);
        setValue("lastName", res.data.lastName);
        setValue("matriculaAUG", res.data.matriculaAUG);
        setValue("handicapIndex", res.data.handicapIndex);
        setValue("birthdate", res.data.birthdate);
        setValue("isWoman", res.data.isWoman);
      }
    }
    loadPlayer();
  }, []);

  return (
    <div className="max-w-xl  items-center mr-16 ml-16">
      <form onSubmit={onSubmit}>
        <div className="mb-3 ">
          <Input
            type="text"
            label="Name"
            placeholder={errors.name ? "Required" : ""}
            {...register("name", { required: true })}
          />
        </div>
        <div className="mb-3">
          <Input
            type="text"
            label="Last name"
            placeholder={errors.lastName ? "Required" : ""}
            {...register("lastName", { required: true })}
          />
        </div>
        <div className="mb-3">
          <Input
            type="text"
            label="Matrícula AUG"
            placeholder={errors.matriculaAUG ? "Required" : ""}
            {...register("matriculaAUG", { required: true })}
          />
        </div>
        <div className="flex w-full flex-wrap md-flex-nowrap gap-4 mb-3">
          <Select
            placeholder={errors.sex ? "Required" : "Select sex"}
            label="Sex"
            className="max-w-xs"
          >
            <SelectItem value="man">Man</SelectItem>
            <SelectItem value="woman">Woman</SelectItem>
          </Select>
        </div>
        <div className="mb-3">
          <Input
            type="number"
            label="Handicap index"
            placeholder={errors.handicapIndex ? "Required" : ""}
            {...register("handicapIndex", { required: true })}
          />
        </div>
        <div className="mb-3">
          <Input
            type="date"
            label="Birthdate"
            placeholder={errors.birthdate ? "Required" : " "}
            {...register("birthdate", { required: false })}
          />
        </div>
        <Button
          
          type="submit"
          onClick={() => {
            if (!params.id) {
              onclose();
            } else {
              cambiarValor;
            }
          }}
          className="bg-purple-600 text-white border border-purple-600 shadow-md hover:bg-purple-800 hover:border-purple-400"
        >
          Save
        </Button>
      </form>
      {params.id && (
        <div className="flex justify-end mt-3" color="danger">
          <Button
            color="danger"
            onClick={async () => {
              const accepted = window.confirm("confirm");
              if (accepted) {
                await deletePlayer(params.id);
                toast.success("deleted player"), navigate("/players");
              }
            }}
          >
            Delete
          </Button>
        </div>
      )}
    </div>
  );
}
