import { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  createTournament,
  updateTournament,
  getTournamentById,
} from "../api/tournaments.api";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  Input,
  Textarea,
  Button,
  Divider,
} from "@nextui-org/react";

export function TournamentsFormPage({ onClose, setRefetch }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm();
  const params = useParams();

  const onSubmit = handleSubmit(async (data) => {
    if (params.id) {
      await updateTournament(params.id, data);
      toast.success("Tournament updated successfully");
    } else {
      await createTournament(data);
      toast.success("Tournament created successfully");
    }
    setRefetch();
    onClose();
  });

  useEffect(() => {
    async function loadTournament() {
      if (params.id) {
        const res = await getTournamentById(params.id);
        console.log(res.data);
        setValue("name", res.data.name);
        setValue("description", res.data.description);
        setValue("tournamentType", res.data.tournamentType);
        setValue("startDate", res.data.startDate);
        setValue("endDate", res.data.endDate);
      }
    }
    loadTournament();
  }, []);

  return (
    <div>
      {!params.id ? (
        <h1 className="text-3xl font-bold mb-3">New Tournament</h1>
      ) : (
        <h1 className="text-3xl font-bold mb-3">Edit Tournament</h1>
      )}
      <Divider className="my-3" />
      <form onSubmit={onSubmit}>
        <div className="mb-3">
          <Input
            type="text"
            label="Tournament Name"
            placeholder={errors.name ? "Required" : " "}
            {...register("name", { required: true })}
          />
        </div>
        <div className="mb-3">
          <Textarea
            label="Description"
            placeholder={errors.description ? "Required" : " "}
            {...register("description", { required: false })}
          />
        </div>
        <div className="mb-3">
          <Input
            type="text"
            label="Type"
            placeholder={errors.tournamentType ? "Required" : " "}
            {...register("tournamentType", { required: true })}
          />
        </div>
        <div className="flex space-x-4 mb-3">
          <Input
            type="date"
            label="Start date"
            placeholder={errors.startDate ? "Required" : " "}
            {...register("startDate", { required: false })}
          />
          <Input
            type="date"
            label="End date"
            placeholder={errors.endDate ? "Required" : " "}
            {...register("endDate", { required: false })}
          />
        </div>
        <div className="flex justify-between mb-2 mt-4">
          <Button color="primary" type="submit" onClick={onClose}>
            Save
          </Button>
          <Button color="warning" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
