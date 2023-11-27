import { useState, useEffect } from 'react'
import { useNavigate } from "react-router-dom";
import {
    Card,
    CardHeader,
    CardBody,
    Divider,
} from "@nextui-org/react";

import { getAllCategory } from "../api/categories.api"

export function Categories() {
  const [categories, setCategories] = useState([])

  useEffect(() => {
    const obtenerCategories = async () => {
      const respuesta = await getAllCategory()
      setCategories(respuesta.data)
    }
    obtenerCategories()
  }, [])

  return (
    <div>
      {categories.map((categoria) => (
        <Card key={categoria.id}>
          <CardHeader>
              <p className="text-md">{categoria.name} </p>
          </CardHeader>
          <Divider />
          <CardBody>
          <p>{categoria.sex}</p>
          <p>{categoria.count}</p>
          </CardBody>
        </Card>
      ))}
    </div>
  )
}
