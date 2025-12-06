import { CourseContentProps } from "./CourseContent.types";

export function CourseContent(props: CourseContentProps) {
  const { chapters } = props;

  return (
    <div>
      <h2 className="text-3xl font-semibold mb-4 pb-4">Contenuto del corso</h2>

      <div className="space-y-6">
        {chapters.map((chapter) => (
          <div
            key={chapter.id}
            className="flex items-start space-x-4 border border-border p-2 rounded-lg 
            hover:bg-accent transition-all"
          >
            {/* Número y círculo comentados - se incluyen internamente */}
            {/* <div
              className="flex-shrink-0 bg-primary text-primary-foreground font-semibold rounded-full 
            w-8 h-8 flex items-center justify-center"
            >
              {index + 1}
            </div> */}

            <div className="flex-1">
              <h4 className="text-xl font-medium text-foreground">
                {chapter.title}
              </h4>
            </div>

            <div className="flex-shrink-0 flex items-center justify-center">
              <span
                className={`px-2 py-1 text-xs rounded-full font-medium 
                ${
                  chapter.isPublished
                    ? "bg-[#60CB58]/20 text-[#0b3d4d]"
                    : "bg-red-100 text-red-800"
                }
                `}
              >
                {chapter.isPublished ? "Pubblicato" : "Non pubblicato"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
