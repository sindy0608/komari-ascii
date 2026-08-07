import Flag from "@/components/sections/Flag";

interface ServerFlagProps {
  country_code: string;
}

export function ServerFlag({ country_code }: ServerFlagProps) {
  return <Flag flag={country_code} size="4" />;
}
