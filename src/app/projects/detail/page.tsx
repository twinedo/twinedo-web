"use client";
import { Header, ProjectDetail } from "../../../components";
import { useGetProjectImages } from "../../../services/projects";
import { useMemo } from "react";
import usePassDetailStore from "@/stores/pass-detail-store";
import { baseUrl } from "@/utils/const";

export default function Detail() {
  const data = usePassDetailStore((state) => state.data);
  // console.log('bucketeqadw', data?.bucket)

  const { data: dataImages } = useGetProjectImages(data?.bucket);
  // console.log('dataadwcccc sadwd', dataImages)

  const images = useMemo(
    () =>
      dataImages?.flatMap(
        (item) => `${baseUrl}/api/project-images${item.url}`
      ),
    [dataImages]
  );

  console.log('images cok', images)

  return (
    <>
      <Header />
      {data && <ProjectDetail data={data} imageData={images ?? []} />}
    </>
  );
}
