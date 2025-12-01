import { IconBadgeProps } from "./IconBadge.types";

export function IconBadge(props: IconBadgeProps) {
  const { icon: Icon, text } = props;

  return (
    <div className="flex items-center gap-2 text-xs">
      <div className="w-6 h-6 flex items-center justify-center bg-[#0b3d4d] rounded-full">
        <Icon className="w-4 h-4 text-white" />
      </div>
      <span className="text-slate-500">{text}</span>
    </div>
  );
}
