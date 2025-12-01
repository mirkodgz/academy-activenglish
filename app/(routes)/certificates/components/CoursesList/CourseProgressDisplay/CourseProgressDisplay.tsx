import { Progress } from "@/components/ui/progress";
import { CourseProgressDisplayProps } from "./CourseProgressDisplay.types";
import { DownloadCertificate } from "./DownloadCertificate";

export function CourseProgressDisplay(props: CourseProgressDisplayProps) {
  const { progress, titleCourse, userName } = props;

  const showProgress = progress === 100;

  return showProgress ? (
    <DownloadCertificate titleCourse={titleCourse} userName={userName} />
  ) : (
    <>
      <Progress value={progress} className="[&>*]:bg-[#60CB58]" />
      <p className="text-xs">{progress}% Completato</p>
    </>
  );
}
