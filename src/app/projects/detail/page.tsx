"use client";
import { Header, ProjectDetail } from "../../../components";
import { useGetProjectImages } from "../../../services/projects";
import { useMemo } from "react";
import usePassDetailStore from "@/stores/pass-detail-store";
import { baseUrl } from "@/utils/const";

export default function Detail() {
  const data = usePassDetailStore((state) => state.data);

  const bucket = data.bucket;

  const { data: dataImages } = useGetProjectImages(bucket);

  const images = useMemo(
    () =>
      dataImages?.flatMap((item) => `${baseUrl}/api/project-images${item.url}`),
    [dataImages]
  );

  return (
    <>
      <Header />
      {data && <ProjectDetail data={data} imageData={images ?? []} />}
    </>
  );
}
