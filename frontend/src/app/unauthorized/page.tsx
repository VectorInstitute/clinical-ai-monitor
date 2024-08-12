import { Box, Heading, Text, Button } from "@chakra-ui/react";
import { useRouter } from "next/navigation";

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <Box textAlign="center" py={10} px={6}>
      <Heading
        display="inline-block"
        as="h2"
        size="2xl"
        bgGradient="linear(to-r, teal.400, teal.600)"
        backgroundClip="text"
      >
        403
      </Heading>
      <Text fontSize="18px" mt={3} mb={2}>
        Unauthorized Access
      </Text>
      <Text color={"gray.500"} mb={6}>
        You do not have permission to access this page.
      </Text>

      <Button
        colorScheme="teal"
        bgGradient="linear(to-r, teal.400, teal.500, teal.600)"
        color="white"
        variant="solid"
        onClick={() => router.push("/home")}
      >
        Go to Home
      </Button>
    </Box>
  );
}
