import { Feature } from "../types-schemas";

export const FeatureUnit = ({
  feature: { Icon, title, text },
}: {
  feature: Feature;
}) => (
  <div className="group bg-background hover:border-primary/50 hover:from-primary/20 hover:to-primary/5 flex h-full min-h-60 gap-3 rounded-md border p-4 transition duration-200 hover:bg-linear-to-br">
    <Icon className="group-hover:text-primary size-8 shrink-0" />

    <div className="flex flex-col gap-6">
      <h3 className="text-xl font-bold wrap-anywhere max-md:text-base">
        {title}
      </h3>
      <p className="font-light max-md:text-sm">{text}</p>
    </div>
  </div>
);
