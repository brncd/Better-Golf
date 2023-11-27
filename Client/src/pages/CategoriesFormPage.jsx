import { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  createCategory,
  deleteCategory,
  updateCategory,
  getCategoryById,
} from "../api/categories.api";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  Button,
  Input,
  Select,
  SelectSection,
  SelectItem,
} from "@nextui-org/react";

export function CategoriesFormPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm();
  const navigate = useNavigate();
  const params = useParams();

  const onSubmit = handleSubmit(async (categoryDefinitionData) => {
    if (params.id) {
      await updateCategory(params.id, categoryDefinitionData);
      toast.success("Updated Category info succesfully"),
        {
          position: "bottom-right",
          style: {
            background: "#2fff00",
            color: "#fff",
          },
        };
    }
  });

  useEffect(() => {
    async function loadCategory() {
      if (params.id) {
        const res = await getCategoryById(params.id);
        setValue("name", res.data.name);
        setValue("holes", res.data.numberOfHoles);
        setValue("Course", res.data.coure);
        setValue("Players", res.data.players);
      }
    }
    loadCategory();
  }, []);

  return (
    <div className="max-w-xl mx-auto">
      <form onSubmit={onSubmit}>
        <div className="mb-3">
          <Input
            type="text"
            label="Name"
            placeholder={errors.name ? "Required" : " "}
            {...register("name", { required: true })}
          />
        </div>
        <div className="mb-3">
          <Input
            type="text"
            label="Number of holes"
            placeholder={errors.name ? "Required" : " "}
            {...register("NumberOfHoles", { required: true })}
          />
        </div>
        <div className="flex w-full flex-wrap md-flex-nowrap gap-4 mb-3">
          <Select
            className="max-w-xs"
            label="Select open course"
            {...register("openCourse", { required: true })}
            placeholder={errors.name ? "Required" : " "}
          >
            <SelectItem value="course1">Test Course 1</SelectItem>
            <SelectItem value="course2">Test Course 2</SelectItem>
            <SelectItem value="course2">Test Course 3</SelectItem>
          </Select>
        </div>
        <div className="mb-3">
          <Select
            label="Select ladies course"
            {...register("ladiesCourse", { required: true })}
            placeholder={errors.name ? "Required" : ""}
            className="max-w-xs"
          >
            <SelectItem value="course1">Test Course 1</SelectItem>
            <SelectItem value="course2">Test Course 2</SelectItem>
            <SelectItem value="course2">Test Course 3</SelectItem>
          </Select>
        </div>
      </form>
    </div>
  );
}
