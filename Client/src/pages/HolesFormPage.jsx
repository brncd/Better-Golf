import { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  
  deleteHoles,
} from "../api/holes.api";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Button, Input,  } from "@nextui-org/react";
import { addHoleToCourse } from "../api/courses.api";

export function HolesFormPage({ onclose, setRefetch }) {
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm();
	const navigate = useNavigate();
	const params = useParams();
	const onSubmit = handleSubmit(async (data) => {
	
			await addHoleToCourse(params.id, data);
			cambiarValor();
			toast.success("Holes created succesfully");
		
	});
	const cambiarValor = () => {
		setRefetch(true);
	};



  return (
		<div className="max-w-xl mx-auto">
			<form onSubmit={onSubmit}>
				<div className="mb-3">
					<Input
						type="text"
						label="par"
						placeholder={errors.par ? "Required" : ""}
						{...register("par", { required: true })}
					/>
				</div>
				<div className="mb-3">
					<Input
						type="text"
						label="number"
						placeholder={errors.number ? "Required" : ""}
						{...register("number", { required: true })}
					/>
				</div>
				<div className="mb-3">
					<Input
						type="text"
						label="strokeIndex"
						placeholder={errors.strokeIndex ? "Required" : ""}
						{...register("strokeIndex", { required: true })}
					/>
				</div>
				<Button color="primary" type="submit" onClick={() => {onclose()}}>
					Save
				</Button>
			</form>

		</div>
	);
}
