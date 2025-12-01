import { CertificateProps } from "./Certificate.types";

export function Certificate(props: CertificateProps) {
  const { userName, titleCourse, certRef } = props;

  return (
    <div
      ref={certRef}
      className="w-full h-[650px] relative 
      bg-[url('/certificado.jpg')] bg-cover bg-center text-[#000]"
    >
      <p
        className="absolute text-4xl tracking-wide
      font-semibold top-[40%] left-1/2 transform -translate-x-1/2"
      >
        {userName}
      </p>

      <p
        className="absolute font-semibold tracking-wide
      text-3xl top-[67%] left-1/2 transform -translate-x-1/2"
      >
        {titleCourse}
      </p>

      <p className="absolute text-sm bottom-32 left-28">
        {new Date().toLocaleDateString()}
      </p>
    </div>
  );
}
