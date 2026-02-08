using System.Security.Cryptography;
using System.Text;

namespace SocialNetwork.Helpers {
    internal class PasswordHelper {
        public static string Hash(string password) {
            byte[] inputBytes = Encoding.UTF8.GetBytes(password);
            byte[] inputHash = SHA256.HashData(inputBytes);
            return Convert.ToBase64String(inputHash);
<<<<<<< Updated upstream
        }
        public static bool Verify(string password, string hashedPassword)
        {
            return Hash(password) == hashedPassword;
=======
>>>>>>> Stashed changes
        }
    }
}