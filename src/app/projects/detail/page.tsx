"use client";
import { Header, ProjectDetail } from "../../../components";
import { useGetProjectImages } from "../../../services/projects";
import { useMemo } from "react";
import usePassDetailStore from "@/stores/pass-detail-store";

export default function Detail() {
  const data = usePassDetailStore((state) => state.data);

  const bucket = data.bucket;

  const { data: dataImages } = useGetProjectImages(bucket);

  const images = useMemo(
    () =>
      dataImages?.flatMap((item) => item.blobUrl),
    [dataImages]
  );

  return (
    <>
      <Header />
      {data && <ProjectDetail data={data} imageData={images ?? []} />}
    </>
  );
}
