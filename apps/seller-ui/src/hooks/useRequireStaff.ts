// TODO: remove mock and restore real auth once backend is wired up
import { MOCK_STAFF } from "@/shared/mocks/staffMockData";

const useRequireStaff = () => {
  // Real implementation (keep for when backend is ready):
  // const router = useRouter();
  // const { seller, isLoading } = useSeller();
  // useEffect(() => {
  //   if (!isLoading && !seller) router.replace("/login");
  //   else if (!isLoading && seller && seller.role !== "staff") router.replace("/dashboard");
  // }, [seller, isLoading, router]);
  // return { staff: seller, isLoading };

  return { staff: MOCK_STAFF, isLoading: false };
};

export default useRequireStaff;
