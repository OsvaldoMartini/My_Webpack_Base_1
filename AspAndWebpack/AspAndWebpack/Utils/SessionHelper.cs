using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Web;

namespace AspAndWebpack.Utils
{
    /// <summary>
    ///     Classe responsável por disponibilizar, para a aplicação, os controles
    ///     necessários para o tratamento de sessão de informações.
    /// </summary>
    public class SessionHelper
    {
      

        public static Stack<string> SessionStack
        {
            get
            {
                var stackVar = RecoverValue<Stack<string>>(SessionName._stack);
                if (stackVar == null)
                {
                    stackVar = new Stack<string>();
                    DefineValue(SessionName._stack, stackVar);

                }
                return  RecoverValue<Stack<string>>(SessionName._stack);
            }
            set
            {
                DefineValue(SessionName._stack, value);
            }
        }


        #region [ DefineValue ]

        /// <summary>
        ///     Method responsible for adding items in object list
        /// </summary>
        /// <param name="sessionName">Name of the session item where the object will be referenced</param>
        /// <param name="value">Object to be referenced</param>
        public static void DefineValue(SessionName sessionName, object value)
        {
            HttpContext.Current.Session[sessionName.ToString()] = value;
        }

        #endregion

        #region [ RecoverValue ]

        /// <summary>
        ///     Method responsible for retrieving items from the list of objects in the system user session.
        /// </summary>
        /// <typeparam name="T">Type of object to be fetched in session</typeparam>
        /// <param name="sessionName">Session Item Name</param>
        /// <returns>Object converted to the indicated type</returns>
        [DebuggerStepThrough]
        public static T RecoverValue<T>(SessionName sessionName)
        {
            return (T) HttpContext.Current.Session[sessionName.ToString()];
        }

        #endregion

        #region [ Remove Value ]

        /// <summary>
        ///     Method responsible for removing items from the list of objects in the system user session.
        /// </summary>
        /// <param name="sessionName">Name of the session item to be removed</param>
        public static void RemoveValue(SessionName sessionName)
        {
            HttpContext.Current.Session.Remove(sessionName.ToString());
            HttpContext.Current.Session[sessionName.ToString()] = null;
        }

        #endregion

        #region [ Abandoning Session ]

        /// <summary>
        ///     Method responsible for forcing the abandonment of the information contained in the current session.
        /// </summary>
        public static void AbandonSession()
        {
            HttpContext.Current.Session.Abandon();
        }

        #endregion

    }

    public enum SessionName
    {
       _stack
    }
}