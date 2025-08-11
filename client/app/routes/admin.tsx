import type { Route } from "./+types/home";
import { columns, type Payment } from "../components/admin-table/columns";
import { DataTable } from "../components/admin-table/table";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Admin" }, { name: "description", content: "Admin Panel" }];
}

async function getData(): Promise<Payment[]> {
  // Fetch data from your API here.
  return [
    {
      id: "728ed52f",
      role: "user",
      email: "m@example.com",
    },
  ];
}

import React, { useEffect, useState } from "react";

export default function Admin() {
  const [data, setData] = useState<Payment[]>([]);

  useEffect(() => {
    getData().then(setData);
  }, []);

  return (
    <div className="container mx-auto py-10">
      <DataTable columns={columns} data={data} />
    </div>
  );
}
